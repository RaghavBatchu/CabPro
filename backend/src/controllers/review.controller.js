import Review from "../models/review.model.js";

// @desc    Get all reviews
// @route   GET /api/reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    res.status(200).json({ average: avgRating, total: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Add a new review
// @route   POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { name, rating, comment } = req.body;

    if (!name || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const review = await Review.create({ name, rating, comment });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Failed to create review", error: error.message });
  }
};
