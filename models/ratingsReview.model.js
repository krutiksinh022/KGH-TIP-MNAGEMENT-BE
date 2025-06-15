import mongoose from "mongoose";

const ratingReviewsSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reviews: {
      type: String,
    },
    ratings: {
      type: Number,
    },
  },
  { timestamps: true }
);

const RatingReviews = mongoose.model("RatingReview", ratingReviewsSchema);

export default RatingReviews;
