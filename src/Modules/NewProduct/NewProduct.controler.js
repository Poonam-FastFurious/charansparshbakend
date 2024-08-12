import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.js";
import { Category } from "../Category/Category.model.js";
import { Product } from "./Product.models.js";

const addProduct = asyncHandler(async (req, res) => {
  try {
    if (!req.body || !req.files) {
      throw new ApiError(400, "Request body or files are missing");
    }

    const {
      title,
      description,
      price,
      discount,
      cutPrice,
      categories,
      tags,
      sku,
      shortDescription,
      stocks,
      youtubeVideoLink,
      hasAttributes,
      attributes,
    } = req.body;

    // Validate required fields
    if (
      ![title, description, price, stocks, sku, categories].every(
        (field) => field && field.trim()
      )
    ) {
      throw new ApiError(400, "All required fields must be filled");
    }

    // Ensure stocks and price are numbers
    const parsedStocks = parseInt(stocks, 10);
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedStocks) || isNaN(parsedPrice)) {
      throw new ApiError(400, "Stocks and price must be valid numbers");
    }

    // Check for existing product by SKU
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      throw new ApiError(409, "Product with the same SKU already exists");
    }

    // Fetch existing category from the database
    const existingCategory = await Category.findOne({
      categoriesTitle: categories,
    });

    if (!existingCategory) {
      throw new ApiError(400, `Invalid category: ${categories}`);
    }

    // Handle image and thumbnail upload
    const imageLocalPath = req.files?.image?.[0]?.path;
    const thumbnailFiles = req.files?.thumbnail;

    if (!imageLocalPath || !thumbnailFiles || thumbnailFiles.length === 0) {
      throw new ApiError(400, "Image and Thumbnail files are required");
    }

    const uploadedImage = await uploadOnCloudinary(imageLocalPath);
    const uploadedThumbnails = await Promise.all(
      thumbnailFiles.map((file) => uploadOnCloudinary(file.path))
    );

    if (!uploadedImage || !uploadedThumbnails.length) {
      throw new ApiError(400, "Failed to upload image or thumbnails");
    }

    // Validate and handle tags
    const parsedTags = Array.isArray(tags) ? tags : [tags]; // Ensure tags is an array

    // Create a new product
    const newProduct = await Product.create({
      title,
      description,
      price: parsedPrice,
      discount,
      cutPrice,
      categories,
      tags: parsedTags,
      sku,
      shortDescription,
      image: uploadedImage.url,
      thumbnail: uploadedThumbnails.map((thumbnail) => thumbnail.url),
      stocks: parsedStocks,
      youtubeVideoLink,
      hasAttributes: hasAttributes === "true", // Convert string to boolean
      attributes: hasAttributes === "true" ? attributes : [],
      status: "inactive", // Default status
    });

    // Return successful response
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct.toObject(),
    });
  } catch (error) {
    console.error("Error during product creation:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export { addProduct };
