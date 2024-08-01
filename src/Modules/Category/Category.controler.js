import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.js";
import { Category } from "./Category.model.js";

const createCategory = async (req, res) => {
  try {
    if (!req.body) {
      throw new ApiError(400, "Request body is missing or empty");
    }

    const { categoriesTitle, link, status } = req.body;

    if (![categoriesTitle, link].every((field) => field?.trim())) {
      throw new ApiError(400, "Categories title and link are required");
    }

    const existingCategory = await Category.findOne({
      $or: [{ categoriesTitle }, { link }],
    });
    if (existingCategory) {
      throw new ApiError(
        409,
        "Category with the same title or link already exists"
      );
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
      link,
      image: imageUrl,
      status,
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
    const { id, categoriesTitle, link, status } = req.body;
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

    // Check for existing category with the same title or link (excluding the current category)
    const existingCategory = await Category.findOne({
      $or: [{ categoriesTitle }, { link }],
      _id: { $ne: id },
    });
    if (existingCategory) {
      throw new ApiError(
        409,
        "Category with the same title or link already exists"
      );
    }

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

  // Delete the category
  await Category.findByIdAndDelete(id);

  return res.json({
    success: true,
    message: "Category deleted successfully",
  });
});
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  return res.json({
    success: true,
    data: categories,
  });
});

export { createCategory, deleteCategory, updateCategory, getAllCategories };
