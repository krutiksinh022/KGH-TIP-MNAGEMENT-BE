import { errorResponse, successResponse } from "../../helpers/common.helpers.js";
import RatingReviews from "../../models/ratingsReview.model.js";

export const HotelEmployeeTip = async(req, resp) => {
    try {
        const user = req.user;
        const hotelDetail=req.hotel
        console.log(req.hotel)
    console.log(user);
    const tipDetail = await RatingReviews.aggregate([
      {
        $match: { hotelId: { $eq: hotelDetail._id } },
      },
      {
        $lookup: {
          from: "users",
          localField: "staffId",
          foreignField: "_id",
          as: "staffDetail",
        },
      },
      {
        $unwind: {
          path: "$staffDetail",
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
          staffName: "$staffDetail.name",
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
        console.log(error)
    return errorResponse(
      resp,
      {
        success: false,
        message: "something went wrong ",
      },
      500
    );
  }
};
