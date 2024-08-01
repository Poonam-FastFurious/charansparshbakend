const reviewSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    rating: { type: String, required: true },
    productName: { type: String, required: true },
    dateReview: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' }
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;