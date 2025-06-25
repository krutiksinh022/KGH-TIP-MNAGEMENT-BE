import {
  errorResponse,
  successResponse,
} from "../../helpers/common.helpers.js";
import RatingReviews from "../../models/ratingsReview.model.js";

export const getStaffTip = async (req, resp) => {
  try {
    const user = req.user;
    
    const tipDetail = await RatingReviews.aggregate([
      {
        $match: { stafId: { $eq: user.staffId } },
      },
      {
        $lookup: {
          from: "hotels",
          localField: "hotelId",
          foreignField: "_id",
          as: "hotelDetail",
        },
      },
      {
        $unwind: {
          path: "$hotelDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
          $project: {
              _id: 1,
              hotelId: 1,
              amount: 1,
              reviews: 1,
              ratings: 1,
              hotelName:"$hotelDetail.hotelName",
        },
      },
    ]);
    return successResponse(
      resp,
      {
        success: true,
        message: "User fetched Successfully ",
        data: tipDetail,
      },
      200
    );
  } catch (error) {
    return errorResponse();
  }
};

