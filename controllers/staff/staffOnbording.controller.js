import {
  errorResponse,
  successResponse,
} from "../../helpers/common.helpers.js";
import HotelStaffEnrollment from "../../models/hotelStaffEnrollment.model.js";

export const StaffOnboardingRequest = async (req, resp) => {
  try {
    const userId = req.user._id;
    const pendingRequest = await HotelStaffEnrollment.aggregate([
      {
        $match: { staffId: { $eq: userId } },
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
        $lookup: {
          from: "users",
          localField: "requestedBy",
          foreignField: "_id",
          as: "senderDetail",
        },
      },
      {
        $unwind: {
          path: "$senderDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          hotelId: 1,
          staffId: 1,
          hotelName: "$hotelDetail.hotelName",
          address: "$hotelDetail.address",
          state: "$hotelDetail.state",
          status: 1,
        },
      },
    ]);

    return successResponse(
      resp,
      {
        success: false,
        message: "Pending request fetch successFully",
        data: pendingRequest,
      },
      200
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      resp,
      { success: false, message: "Something went wrong" },
      500,
      error.message
    );
  }
};

export const responseStaffRequest = (req,resp) => {
    try {
        const { response } = req.body;
        console.log(response)
  } catch (error) {
    return errorResponse(
      resp,
      { success: false, message: "Something went wrong" },
      500,
      error.message
    );
  }
};
