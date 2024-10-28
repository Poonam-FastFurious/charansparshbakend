import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.js";
import { Category } from "../Category/Category.model.js";

import { HeaderCategory } from "./Headercategory.model.js";

const createHeaderCategory = asyncHandler(async (req, res) => {
  try {
    if (!req.body) {
      throw new ApiError(400, "Request body is missing or empty");
    }

    const { categoriesTitle, content, status, mainHeading } = req.body;

    // Validate required fields
    if (
      ![categoriesTitle, content, mainHeading].every((field) => field?.trim())
    ) {
      throw new ApiError(
        400,
        "Header category, content, and main heading are required"
      );
    }

    // Check if the headerCategory exists in Category model
    const existingCategory = await Category.findOne({ categoriesTitle });
    if (!existingCategory) {
      throw new ApiError(404, "Referenced category does not exist");
    }

    // Handle image upload
    let imageUrls = [];
    if (req.files?.image && req.files.image.length > 0) {
      for (const file of req.files.image) {
        try {
          const image = await uploadOnCloudinary(file.path);
          if (!image) {
            throw new ApiError(400, "Failed to upload image");
          }
          imageUrls.push(image.url);
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          throw new ApiError(500, "Error occurred during image upload");
        }
      }
    }

    // Handle audio upload (if applicable)
    let audioUrl;
    if (req.files?.audio && req.files.audio[0]?.path) {
      try {
        const audioUpload = await uploadOnCloudinary(req.files.audio[0].path);
        if (!audioUpload) {
          throw new ApiError(400, "Failed to upload audio");
        }
        audioUrl = audioUpload.url;
      } catch (uploadError) {
        console.error("Audio upload error:", uploadError);
        throw new ApiError(500, "Error occurred during audio upload");
      }
    }

    // Create header category
    const headerCategoryData = await HeaderCategory.create({
      categoriesTitle, // Referenced category _id
      image: imageUrls,
      content,
      audio: audioUrl,
      status,
      mainHeading,
    });

    const { _id: _, ...createdHeaderCategory } = headerCategoryData.toObject();

    // Send success response
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          createdHeaderCategory,
          "Header category created successfully"
        )
      );
  } catch (error) {
    console.error("Error during header category creation:", error);

    // Handle ApiError responses
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    // Handle unexpected server errors
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});
const getAllHeaderCategories = asyncHandler(async (req, res) => {
  try {
    // Fetch all header categories, populate the referenced category
    const headerCategories = await HeaderCategory.find();

    if (!headerCategories.length) {
      throw new ApiError(404, "No header categories found");
    }

    // Send the response with the fetched header categories
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          headerCategories,
          "Header categories fetched successfully"
        )
      );
  } catch (error) {
    console.error("Error during fetching header categories:", error);

    // Handle ApiError responses
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    // Handle unexpected server errors
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});
const deleteHeaderCategory = asyncHandler(async (req, res) => {
  try {
    // Check if the category ID is provided in the query
    const { id } = req.body;
    if (!id) {
      throw new ApiError(400, "Header category ID is required");
    }

    // Check if the header category exists
    const existingHeaderCategory = await HeaderCategory.findById(id);
    if (!existingHeaderCategory) {
      throw new ApiError(404, "Header category not found");
    }

    // Delete the header category
    await HeaderCategory.findByIdAndDelete(id);

    // Send success response
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Header category deleted successfully"));
  } catch (error) {
    console.error("Error during header category deletion:", error);

    // Handle ApiError responses
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    // Handle unexpected server errors
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});
export { createHeaderCategory, getAllHeaderCategories, deleteHeaderCategory };
