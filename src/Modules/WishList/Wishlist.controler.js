import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { Product } from "../Product/Product.models.js";
import { Wishlist } from "./Wishlist.modal.js";

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  if (!req.user || !req.user._id) {
    throw new ApiError(401, "User not authenticated");
  }

  try {
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Log the retrieved product

    // Find the user's wishlist
    let wishlist = await Wishlist.findOne({ userId: req.user._id });

    // If the user doesn't have a wishlist, create a new one
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user._id,
        name: "Default Wishlist",
        items: [],
      });
    }

    // Check if the product is already in the wishlist
    const existingItemIndex = wishlist.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // If the product is already in the wishlist, update the addedAt timestamp
      wishlist.items[existingItemIndex].addedAt = Date.now();
    } else {
      // If the product is not in the wishlist, add it as a new item
      wishlist.items.push({
        productId: product._id,
        productName: product.title,
        productDescription: product.description,
        quantity: 1,
        price: product.price,
        url: product.thumbnail[0], // Ensure product.thumbnail exists
        addedAt: Date.now(),
      });
    }

    // Save the wishlist
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully",
      wishlist,
    });
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    throw new ApiError(500, "Error adding product to wishlist");
  }
});

const getWishlist = asyncHandler(async (req, res) => {
  // Ensure user is authenticated
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "User not authenticated");
  }

  // Find the user's wishlist
  const wishlist = await Wishlist.findOne({ userId: req.user._id });

  if (!wishlist) {
    // If wishlist doesn't exist, return appropriate message or error
    throw new ApiError(404, "Wishlist not found");
  }

  // Return the wishlist
  res.status(200).json({
    success: true,
    message: "Wishlist retrieved successfully",
    wishlist,
  });
});
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  if (!req.user || !req.user._id) {
    throw new ApiError(401, "User not authenticated");
  }

  try {
    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    // If wishlist doesn't exist, throw an error or handle accordingly
    if (!wishlist) {
      throw new ApiError(404, "Wishlist not found");
    }

    // Check if the product exists in the wishlist
    const existingItemIndex = wishlist.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex === -1) {
      throw new ApiError(404, "Product not found in wishlist");
    }

    // Remove the product from the wishlist items array
    wishlist.items.splice(existingItemIndex, 1);

    // Save the updated wishlist
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
      wishlist,
    });
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    if (error instanceof ApiError) {
      throw error; // Rethrow ApiError instances
    } else {
      throw new ApiError(500, "Error removing product from wishlist");
    }
  }
});

export { addToWishlist, getWishlist, removeFromWishlist };
