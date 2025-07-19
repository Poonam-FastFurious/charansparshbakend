import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.js";
import { Product } from "../Product/Product.models.js";
import { Category } from "./Category.model.js";

// ✅ Create Category
const createCategory = async (req, res) => {
  try {
    if (!req.body) {
      throw new ApiError(400, "Request body is missing or empty");
    }

    const {
      categoriesTitle,
      description,
      status,
      isHeaderCategory,
      isCollectionCategory,
    } = req.body;

    if (![categoriesTitle].every((field) => field?.trim())) {
      throw new ApiError(400, "Categories title is required");
    }

    const existingCategory = await Category.findOne({ categoriesTitle });
    if (existingCategory) {
      throw new ApiError(409, "Category with the same title already exists");
    }

    let imageUrl;
    const imageLocalPath = req.files?.image?.[0]?.path;
    if (imageLocalPath) {
      const image = await uploadOnCloudinary(imageLocalPath);
      if (!image) {
        throw new ApiError(400, "Failed to upload image");
      }
      imageUrl = image.url;
    }

    const category = await Category.create({
      categoriesTitle,
      description,
      image: imageUrl,
      status,
      isHeaderCategory: !!isHeaderCategory,
      isCollectionCategory: !!isCollectionCategory,
    });

    const { _id: _, ...createdCategory } = category.toObject();

    return res
      .status(201)
      .json(
        new ApiResponse(200, createdCategory, "Category created successfully")
      );
  } catch (error) {
    console.error("Error during category creation:", error);
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ✅ Update Category
const updateCategory = async (req, res) => {
  try {
    const {
      id,
      categoriesTitle,
      description,
      status,
      isHeaderCategory,
      isCollectionCategory,
    } = req.body;

    if (!id) {
      throw new ApiError(400, "Category ID is required");
    }

    const updateFields = {};
    if (categoriesTitle?.trim()) updateFields.categoriesTitle = categoriesTitle;
    if (description?.trim()) updateFields.description = description;
    if (status?.trim()) updateFields.status = status;
    if (isHeaderCategory !== undefined)
      updateFields.isHeaderCategory = isHeaderCategory;
    if (isCollectionCategory !== undefined)
      updateFields.isCollectionCategory = isCollectionCategory;

    const imageLocalPath = req.files?.image?.[0]?.path;
    if (imageLocalPath) {
      const image = await uploadOnCloudinary(imageLocalPath);
      if (!image) {
        throw new ApiError(400, "Failed to upload image");
      }
      updateFields.image = image.url;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      throw new ApiError(404, "Category not found");
    }

    const { _id, __v, ...updatedCategoryResponse } = updatedCategory.toObject();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedCategoryResponse,
          "Category updated successfully"
        )
      );
  } catch (error) {
    console.error("Error during category update:", error);
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ✅ Delete Category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.query;

  const category = await Category.findById(id);
  if (!category) {
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  }

  const productsWithCategory = await Product.find({ categories: category._id });
  if (productsWithCategory.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Category cannot be deleted as it has associated products",
    });
  }

  await Category.findByIdAndDelete(id);

  return res.json({
    success: true,
    message: "Category deleted successfully",
  });
});

// ✅ Get all categories (with subcategories and product count)
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: "subcategories",
        localField: "_id",
        foreignField: "category",
        as: "subcategories",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "categoriesTitle",
        foreignField: "categories",
        as: "products",
      },
    },
    {
      $addFields: {
        productCount: { $size: "$products" },
      },
    },
    {
      $project: {
        products: 0,
      },
    },
  ]);

  return res.json({
    success: true,
    data: categories,
  });
});
// controllers/categoryController.js
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  }
  res.status(200).json({ success: true, data: category });
});

export {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
};
