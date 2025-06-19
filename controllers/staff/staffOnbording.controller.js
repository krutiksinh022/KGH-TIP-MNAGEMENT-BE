import { HOTEL_STAFF_ENROLLMENT } from "../../constants/common.constants.js";
import {
  errorResponse,
  successResponse,
} from "../../helpers/common.helpers.js";
import Hotel from "../../models/hotel.model.js";
import HotelStaffEnrollment from "../../models/hotelStaffEnrollment.model.js";
import StaffDetail from "../../models/staffDetail.model.js";
import { requestResponseValidator } from "../../validators/staff.validators.js";

export const StaffOnboardingRequest = async (req, resp) => {
  try {
    const userId = req.user._id;
    const statusQuery = req.query.status; // Get status from query parameters

    const matchStage = {
      staffId: { $eq: userId },
    };

    if (statusQuery) {
      matchStage.status = statusQuery; // Add status filter if provided
    }
    const pendingRequest = await HotelStaffEnrollment.aggregate([
      {
        $match: matchStage,
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

export const responseStaffRequest = async (req, resp) => {
  try {
    const { requestId } = req.params;
    
    const { response } = await requestResponseValidator.validateAsync(req.body);
    const requestDetail = await HotelStaffEnrollment.findById(requestId);
    if (!requestDetail) {
      return errorResponse(resp, {
        success: false,
        message: "Request not found",
      },401);
    }
    // if (requestDetail.status !== HOTEL_STAFF_ENROLLMENT.PENDING) {
    //   return errorResponse(
    //     resp,
    //     {
    //       success: false,
    //       message: "Status Aprroved or Reject already",
    //     },
    //     402
    //   );
    // }
    requestDetail.status = response;
    await requestDetail.save();
    if (response == HOTEL_STAFF_ENROLLMENT.APPROVE) {
      await StaffDetail.findOneAndUpdate(
        { staffId: requestDetail.staffId },
        {
          $addToSet: { enrolledHotels: requestDetail.hotelId },
        }
      );

      await Hotel.findByIdAndUpdate(requestDetail.hotelId, {
        $addToSet: { staff: requestDetail.staffId },
      });
    }
    return successResponse(
      resp,
      { success: true, message: `Request ${response}` },
      200
    );
  } catch (error) {
    console.log(error)
    return errorResponse(
      resp,
      { success: false, message: "Something went wrong" },
      500,
      error
    );
  }
};
