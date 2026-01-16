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

// @desc    Get all issue reports
// @route   GET /api/reviews/issues
export const getIssueReports = async (req, res) => {
  try {
    const issues = await Review.find({ isIssueReport: true })
      .populate("historyId", "origin destination date time driverName")
      .sort({ createdAt: -1 });
    res.status(200).json({ total: issues.length, issues });
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

    const review = await Review.create({ name, rating, comment, isIssueReport: false });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Failed to create review", error: error.message });
  }
};

// @desc    Create an issue report
// @route   POST /api/reviews/report-issue
export const reportIssue = async (req, res) => {
  try {
    const { name, comment, historyId } = req.body;

    if (!name || !comment || !historyId) {
      return res.status(400).json({ message: "Name, comment, and historyId are required" });
    }

    const issue = await Review.create({
      name,
      rating: 1, // Default low rating for issues
      comment,
      historyId,
      isIssueReport: true,
    });
    
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: "Failed to report issue", error: error.message });
  }
};
