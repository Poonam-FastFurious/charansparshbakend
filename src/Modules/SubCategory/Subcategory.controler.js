import { Category } from "../Category/Category.model.js";
import { SubCategory } from "./Subcategory.modal.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.js";

export const createSubCategory = async (req, res) => {
  try {
    if (!req.body) {
      throw new ApiError(400, "Request body is missing or empty");
    }

    const { subCategoryTitle, link, status, categoryName } = req.body;

    if (
      ![subCategoryTitle, link, categoryName].every((field) => field?.trim())
    ) {
      throw new ApiError(
        400,
        "Subcategory title, link, and category name are required"
      );
    }

    const existingCategory = await Category.findOne({
      categoriesTitle: categoryName,
    });
    if (!existingCategory) {
      throw new ApiError(404, "Category not found");
    }

    let imageUrl;
    if (req.files && req.files.image) {
      const imageLocalPath = req.files.image[0].path;
      const image = await uploadOnCloudinary(imageLocalPath);
      if (!image) {
        throw new ApiError(400, "Failed to upload image");
      }
      imageUrl = image.url;
    }

    const subCategory = await SubCategory.create({
      subCategoryTitle,
      link,
      image: imageUrl,
      status,
      category: existingCategory._id,
    });

    // Fetch the category name for response
    const categoryNameResponse = existingCategory.categoriesTitle;

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          { ...subCategory.toObject(), category: categoryNameResponse },
          "Subcategory created successfully"
        )
      );
  } catch (error) {
    console.error("Error during subcategory creation:", error);

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
export const getAllSubCategories = async (req, res) => {
  try {
    // Retrieve all subcategories from the database and populate the category field with the category name
    const subCategories = await SubCategory.find().populate({
      path: "category",
      select: "categoriesTitle -_id",
    });

    // If no subcategories found, return an empty array
    if (!subCategories || subCategories.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, [], "No subcategories found"));
    }

    // Otherwise, return the subcategories
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subCategories,
          "Subcategories retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error while retrieving subcategories:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, [], "Internal server error"));
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const { id, subCategoryTitle, link, status } = req.body;

    if (!id) {
      throw new ApiError(400, "Subcategory ID is required");
    }

    // Find the existing subcategory
    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      throw new ApiError(404, "Subcategory not found");
    }

    // Find the category by name

    // Update fields if they are provided
    if (subCategoryTitle) subCategory.subCategoryTitle = subCategoryTitle;
    if (link) subCategory.link = link;
    if (status) subCategory.status = status;

    // Handle image upload if provided
    if (req.files && req.files.image) {
      const imageLocalPath = req.files.image[0].path;
      const image = await uploadOnCloudinary(imageLocalPath);
      if (!image) {
        throw new ApiError(400, "Failed to upload image");
      }
      subCategory.image = image.url;
    }

    // Save the updated subcategory
    await subCategory.save();

    // Fetch the category name for response

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...subCategory.toObject() },
          "Subcategory updated successfully"
        )
      );
  } catch (error) {
    console.error("Error during subcategory update:", error);

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

export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      throw new ApiError(400, "Subcategory ID is required");
    }

    // Find and delete the subcategory
    const subCategory = await SubCategory.findByIdAndDelete(id);
    if (!subCategory) {
      throw new ApiError(404, "Subcategory not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, subCategory, "Subcategory deleted successfully")
      );
  } catch (error) {
    console.error("Error during subcategory deletion:", error);

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
