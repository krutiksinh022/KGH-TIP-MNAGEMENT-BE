import Stripe from "stripe";
import {
  errorResponse,
  successResponse,
} from "../../helpers/common.helpers.js";
import StaffDetail from "../../models/staffDetail.model.js";
import {
  reviewRatingValidator,
  sendTipValidator,
} from "../../validators/tip.validators.js";
import Hotel from "../../models/hotel.model.js";
import RatingReviews from "../../models/ratingsReview.model.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const sendTip = async (req, resp) => {
  try {
    const { staffId, amount, hotelId, ratings, reviews } =
      await sendTipValidator.validateAsync(req.body);
    const findStaff = await StaffDetail.findOne({ staffId: staffId });
    if (!findStaff) {
      return errorResponse(
        resp,
        { success: false, message: "Staff not found" },
        402
      );
    }
    if (!findStaff.staffId || !findStaff.isStripeConnected) {
      return errorResponse(
        resp,
        { success: false, message: "Employee verification Pending" },
        402
      );
      }
      const HotelDetail = await Hotel.findById(hotelId);
      if (!HotelDetail) {
        return errorResponse(
          resp,
          {
            success: false,
            message: "Hotel Not Found",
          },
          402
        );
      }
      if (!findStaff.enrolledHotels.includes(hotelId)) {
        return errorResponse(resp, {
          success: false,
          message: "This staff not enrolled in hotel",
        });
      }
      
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      description: `Tip for staff`,
      payment_method_types: ["card"],
      transfer_data: {
        destination: findStaff.stripeId,
      },
    });
    return successResponse(
      resp,
      {
        success: true,
        message: "Stripe connected successfully",
        data: paymentIntent.client_secret,
      },
      200
    );
  } catch (error) {
    return errorResponse(
      resp,
      {
        success: false,
        message: "Something went wrong",
      },
      500,
      error
    );
  }
};

export const createReviews = async (req, resp) => {
  try {
    const { hotelId, staffId, amount, reviews, ratings } =
      await reviewRatingValidator.validateAsync(req.body);
    const HotelDetail = await Hotel.findById(hotelId);
    if (!HotelDetail) {
      return errorResponse(
        resp,
        {
          success: false,
          message: "Hotel Not Found",
        },
        402
      );
    }

    const staff = await StaffDetail.findOne({ staffId });
    if (!staff) {
      return errorResponse(
        resp,
        {
          success: false,
          message: "Satff not fount",
        },
        402
      );
    }

    if (!staff.enrolledHotels.includes(hotelId)) {
      return errorResponse(resp, {
        success: false,
        message: "This staff not enrolled in hotel",
      });
    }

    const newReviews = new RatingReviews({
      hotelId,
      staffId,
      amount,
      reviews,
      ratings,
    });

    await newReviews.save();

    return successResponse(
      resp,
      { success: true, message: "Reviews submitted successfully" },
      201
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      resp,
      {
        success: false,
        message: "Something went wrong",
      },
      500,
      error
    );
  }
};
