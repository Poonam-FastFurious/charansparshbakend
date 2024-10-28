import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.js";
import { Product } from "../Product/Product.models.js";
import { Category } from "./Category.model.js";

const createCategory = async (req, res) => {
  try {
    if (!req.body) {
      throw new ApiError(400, "Request body is missing or empty");
    }

    const { categoriesTitle, status, isHeaderCategory, isCollectionCategory } =
      req.body;

    if (![categoriesTitle].every((field) => field?.trim())) {
      throw new ApiError(400, "Categories title  are required");
    }

    const existingCategory = await Category.findOne({
      $or: [{ categoriesTitle }],
    });
    if (existingCategory) {
      throw new ApiError(409, "Category with the same title  already exists");
    }

    const imageLocalPath = req.files?.image[0].path;
    let imageUrl;
    if (imageLocalPath) {
      const image = await uploadOnCloudinary(imageLocalPath);
      if (!image) {
        throw new ApiError(400, "Failed to upload image");
      }
      imageUrl = image.url;
    }

    const category = await Category.create({
      categoriesTitle,

      image: imageUrl,
      status,
      isHeaderCategory: !!isHeaderCategory, // Ensure it's a boolean
      isCollectionCategory: !!isCollectionCategory, // Ensure it's a boolean
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
const updateCategory = async (req, res) => {
  try {
    const {
      id,
      categoriesTitle,
      link,
      status,
      isHeaderCategory,
      isCollectionCategory,
    } = req.body;
    if (!id) {
      throw new ApiError(400, "Category ID is required");
    }

    if (!req.body) {
      throw new ApiError(400, "Request body is missing or empty");
    }

    const updateFields = {};
    if (categoriesTitle?.trim()) updateFields.categoriesTitle = categoriesTitle;
    if (link?.trim()) updateFields.link = link;
    if (status?.trim()) updateFields.status = status;
    updateFields.isHeaderCategory =
      isHeaderCategory !== undefined ? isHeaderCategory : undefined;
    updateFields.isCollectionCategory =
      isCollectionCategory !== undefined ? isCollectionCategory : undefined;

    // Check for existing category with the same title or link (excluding the current category)

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

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.query;

  // Check if category exists
  const category = await Category.findById(id);
  if (!category) {
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  }

  // Extract category name for checking associated products
  const categoryName = category.categoriesTitle;

  // Check if there are products associated with this category name
  const productsWithCategory = await Product.find({ categories: categoryName });
  if (productsWithCategory.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Category cannot be deleted as it has associated products",
    });
  }

  // Delete the category
  await Category.findByIdAndDelete(id);

  return res.json({
    success: true,
    message: "Category deleted successfully",
  });
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: "subcategories", // Collection name in MongoDB (must be subcategories, pluralized by MongoDB)
        localField: "_id", // Match the category _id
        foreignField: "category", // Match with the category field in the subcategories
        as: "subcategories", // The name of the array that will contain the subcategories
      },
    },
    {
      $lookup: {
        from: "products", // Collection name for products
        localField: "categoriesTitle",
        foreignField: "categories",
        as: "products",
      },
    },
    {
      $addFields: {
        productCount: { $size: "$products" }, // Add product count
      },
    },
    {
      $project: {
        products: 0, // Exclude products array if not needed in response
      },
    },
  ]);

  return res.json({
    success: true,
    data: categories,
  });
});

export { createCategory, deleteCategory, updateCategory, getAllCategories };
