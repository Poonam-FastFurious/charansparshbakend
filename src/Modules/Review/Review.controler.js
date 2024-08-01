import Review from './review.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

// Get all reviews
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({});
  if (!reviews) {
    throw new ApiError(404, 'No reviews found');
  }
  res.status(200).json(new ApiResponse(200, reviews, 'Reviews fetched successfully'));
});

// Add a new review
const addReview = asyncHandler(async (req, res) => {
  const { customerName, rating, productName } = req.body;

  if (!customerName || !rating || !productName) {
    throw new ApiError(400, 'All fields are required');
  }

  const review = new Review({
    customerName,
    rating,
    productName
  });

  await review.save();

  res.status(201).json(new ApiResponse(201, review, 'Review added successfully'));
});

// Delete a review
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findByIdAndDelete(id);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  res.status(200).json(new ApiResponse(200, {}, 'Review deleted successfully'));
});

export {
  getReviews,
  addReview,
  deleteReview
};