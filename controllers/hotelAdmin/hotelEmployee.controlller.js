import mongoose from "mongoose";
import { HOTEL_STAFF_ENROLLMENT } from "../../constants/common.constants.js";
import {
  errorResponse,
  successResponse,
} from "../../helpers/common.helpers.js";
import { paginationHelper } from "../../helpers/pagination.helper.js";
import HotelAdminDetail from "../../models/hotelAdminDetail.modal.js";
import HotelStaffEnrollment from "../../models/hotelStaffEnrollment.model.js";
import StaffDetail from "../../models/staffDetail.model.js";
import { StaffOnboardingRequest } from "../staff/staffOnbording.controller.js";

export const getStripeConnectedEmployee = (req, res) => {
  try {
  } catch (error) {
    return errorResponse(
      res,
      { success: false, message: "Something went wrong" },
      500
    );
  }
};

export const getRegisterEmployee = async (req, resp) => {
  try {
    const { skip, limit, searchTerm, sortField, sortOrder } = paginationHelper(
      req.query
    );
    console.log("register employe")
    const matchStage = {
      isStripeConnected: true,
    };

    const searchMatch = searchTerm
      ? {
          $or: [
            { "staffDetail.name": { $regex: searchTerm, $options: "i" } },
            { city: { $regex: searchTerm, $options: "i" } },
            { state: { $regex: searchTerm, $options: "i" } },
          ],
        }
      : {};

    const Staff = await StaffDetail.aggregate([
      {
        $match: matchStage,
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
        $match: searchMatch,
      },
      {
        $project: {
          _id: 1,
          staffId: 1,
          city: 1,
          state: 1,
          isStripeConnected: 1,
          status:1,
          staffName: "$staffDetail.name",
          createdAt: "$staffDetail.createdAt",
        },
      },
      {
        $sort: {
          [sortField]: sortOrder,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    return successResponse(
      resp,
      { success: true, message: "Staff fetched successfully", data: Staff },
      200
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      resp,
      { success: false, message: "Something went wrong" },
      500
    );
  }
};

export const sendOnbordingRequest = async (req, resp) => {
  try {
    const { staffId } = req.body;
    const staff = await StaffDetail.findOne({ staffId });
    const userId = req.user._id;

    if (!staff) {
      return errorResponse(
        resp,
        { success: false, message: "Satff memeber is not found" },
        401
      );
    }

    const hotelAdminDetail = await HotelAdminDetail.findOne({
      adminId: userId,
    });
    if (!hotelAdminDetail) {
      return errorResponse(
        resp,
        { success: false, message: "Hotel not found" },
        401
      );
    }
    const isAlreadyRequestSent = await HotelStaffEnrollment.findOne({
      hotelId:new mongoose.Types.ObjectId( hotelAdminDetail.hotelId),
      staffId:new mongoose.Types.ObjectId( staff.staffId),
    });
  
    if (isAlreadyRequestSent) {
      return errorResponse(
        resp,
        { success: false, message: "Already request sent" },
        401
      );
    }

    const sentOnBoardingRequest = new HotelStaffEnrollment({
      staffId,
      hotelId: hotelAdminDetail.hotelId,
      status: HOTEL_STAFF_ENROLLMENT.PENDING,
      requestedBy: userId,
    });

    const saveOnboardingRequest = await sentOnBoardingRequest.save();

    return successResponse(
      resp,
      {
        success: false,
        message: "onboarding request sent successfully",
        data: saveOnboardingRequest,
      },
      200
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      resp,
      { success: false, message: "something went wrong" },
      500
    );
  }
};

export const MyEmployee = async (req, resp) => {
  try {
    const hotelId = req.hotel._id;
    //  console.log(req.hotel)
    const findMyEmployee = await HotelStaffEnrollment.aggregate([
      {
        $match: { hotelId: { $eq: hotelId } },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "staffId",
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
          staffId: 1,
          status: 1,
          staffName: "$staffDetail.name",
          staffEmail: "$staffDetail.email",
        },
      },
    ]);

    return successResponse(
      resp,
      {
        success: true,
        message: "hotel fecthed succesfully",
        data: findMyEmployee,
      },
      200
    );
  } catch (error) {
    return errorResponse(
      resp,
      { success: false, message: "something went wrong" },
      500
    );
  }
};

export const requestHistory = async (req, resp) => {
  try {
    const hotelId = req.hotel._id;
    const { status } = req.query;

    const matchStage = {
      hotelId: { $eq: { hotelId } },
    };
    const findStaffDetail = await HotelStaffEnrollment.aggregate([
      {
        $match: { hotelId: hotelId },
      },
      {
        $match: { status: status },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "staffId",
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
          staffId: 1,
          hotelId: 1,
          status: 1,
          staffName: "$staffDetail.name",
          staffEmail: "$staffDetail.email",
        },
      },
    ]);
    return successResponse(
      resp,
      {
        success: true,
        message: "requestHistory retrivr Successfullly",
        data: findStaffDetail,
      },
      200
    );
  } catch (error) {
    return errorResponse(
      resp,
      { success: false, message: "something went wrong" },
      500
    );
  }
};
