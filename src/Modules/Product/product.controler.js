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
      status: "active",
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

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    // Extract query parameters for pagination, filtering, and search
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    // Validate pagination parameters
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;

    if (pageNumber < 1 || pageSize < 1) {
      throw new ApiError(400, "Invalid pagination parameters");
    }

    // Construct the query object for filtering and searching
    const query = {};

    // Add category filter if provided
    if (category) {
      query.categories = category;
    }

    // Add price range filters if provided
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        query.price = { ...query.price, $gte: min };
      }
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        query.price = { ...query.price, $lte: max };
      }
    }

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, "i"); // 'i' for case-insensitive search
      query.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } },
      ];
    }

    // Fetch the products with pagination and filtering
    const products = await Product.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    // Count the total number of products matching the query
    const totalProducts = await Product.countDocuments(query);

    // Send the response
    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
      total: totalProducts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / pageSize),
    });
  } catch (error) {
    console.error("Error retrieving products:", error);

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

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    // Check if the product ID is provided
    const { id } = req.query; // Get product ID from query parameters

    if (!id) {
      throw new ApiError(400, "Product ID is required");
    }

    // Attempt to find and delete the product
    const product = await Product.findByIdAndDelete(id);

    // Check if the product was found and deleted
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Return a success response
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error during product deletion:", error);

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
const getSingleProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.query; // Assuming the product ID is passed as a URL parameter

    // Validate ID presence
    if (!id) {
      throw new ApiError(400, "Product ID is required");
    }

    // Find the product by ID
    const product = await Product.findById(id);

    // Check if product was found
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Return the product details
    return res.status(200).json({
      success: true,
      product: product.toObject(), // Convert Mongoose document to plain object
    });
  } catch (error) {
    console.error("Error fetching product details:", error);

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
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
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
    } = req.body;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Validate SKU if provided
    if (sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct && existingProduct._id.toString() !== id) {
        throw new ApiError(409, "Product with the same SKU already exists");
      }
    }

    // Validate category if provided
    if (categories) {
      const existingCategory = await Category.findOne({
        categoriesTitle: categories,
        status: "active",
      });
      if (!existingCategory) {
        throw new ApiError(400, `Invalid category: ${categories}`);
      }
    }

    // Handle image and thumbnail updates if files are provided
    if (req.files) {
      const { image, thumbnail } = req.files;

      if (image) {
        const uploadedImage = await uploadOnCloudinary(image[0].path);
        if (!uploadedImage) {
          throw new ApiError(400, "Failed to upload image");
        }
        product.image = uploadedImage.url;
      }

      if (thumbnail) {
        const uploadedThumbnails = await Promise.all(
          thumbnail.map((file) => uploadOnCloudinary(file.path))
        );
        if (!uploadedThumbnails.length) {
          throw new ApiError(400, "Failed to upload thumbnails");
        }
        product.thumbnail = uploadedThumbnails.map(
          (thumbnail) => thumbnail.url
        );
      }
    }

    // Update product fields if they are provided
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (discount) product.discount = discount;
    if (cutPrice) product.cutPrice = cutPrice;
    if (categories) product.categories = categories;
    if (tags) product.tags = Array.isArray(tags) ? tags : [tags];
    if (sku) product.sku = sku;
    if (shortDescription) product.shortDescription = shortDescription;
    if (stocks) product.stocks = parseInt(stocks, 10);
    if (youtubeVideoLink) product.youtubeVideoLink = youtubeVideoLink;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: product.toObject(),
    });
  } catch (error) {
    console.error("Error during product update:", error);

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
const buildQuery = (params) => {
  const query = {};

  if (params.title) {
    query.title = { $regex: params.title, $options: "i" };
  }
  if (params.description) {
    query.description = { $regex: params.description, $options: "i" };
  }
  if (params.price) {
    query.price = params.price;
  }
  if (params.stocks) {
    query.stocks = params.stocks;
  }
  if (params.discount) {
    query.discount = params.discount;
  }
  if (params.cutPrice) {
    query.cutPrice = params.cutPrice;
  }
  if (params.categories) {
    query.categories = params.categories;
  }
  if (params.tags) {
    query.tags = { $in: params.tags };
  }
  if (params.sku) {
    query.sku = params.sku;
  }
  if (params.shortDescription) {
    query.shortDescription = { $regex: params.shortDescription, $options: "i" };
  }
  if (params.youtubeVideoLink) {
    query.youtubeVideoLink = { $regex: params.youtubeVideoLink, $options: "i" };
  }
  if (params.thumbnail) {
    query.thumbnail = { $in: params.thumbnail };
  }

  return query;
};

const searchProducts = asyncHandler(async (req, res) => {
  const query = buildQuery(req.query);

  const products = await Product.find(query);

  if (products.length === 0) {
    await SearchData.create({ searchParam: req.query });
    throw new ApiError(404, "No products found matching the criteria.");
  }

  return res.json(
    new ApiResponse(200, products, "Products retrieved successfully")
  );
});

export {
  addProduct,
  getAllProducts,
  deleteProduct,
  getSingleProduct,
  updateProduct,
  searchProducts,
};
