import mongoose from "mongoose";
import Hotel from "../../models/hotel.model.js";
import User from "../../models/user.model.js";
import HotelAdminDetail from "../../models/hotelAdminDetail.model.js";
import {
  errorResponse,
  successResponse,
  generateDefaultPassword,
} from "../../helpers/common.helpers.js";
import { USER_TYPES } from "../../constants/common.constants.js";
import { sendEmail } from "../../helpers/nodemail.helper.js";
import { createHotelTemplate } from "../../MailTemplate/HotelMail.js";
import { paginationHelper } from "../../helpers/pagination.helper.js";

// ✅ Create Hotel (with multiple admins)
export const createHotel = async (req, res) => {
  try {
    const {
      hotelName,
      website,
      address1,
      address2,
      city,
      state,
      zipcode,
      country,
      phone,
      adminEmail = [], // can be array or string
      allowSuperAdminAccess = true,
      status = "Active",
    } = req.body;

    const adminEmails = Array.isArray(adminEmail)
      ? adminEmail
      : [adminEmail].filter(Boolean);

    if (!adminEmails.length) {
      return errorResponse(
        res,
        { message: "At least one admin email required" },
        400
      );
    }

    const hotel = await Hotel.create({
      hotelName,
      website,
      address1,
      address2,
      city,
      state,
      zipcode,
      country,
      phone,
      allowSuperAdminAccess,
      status,
      createdBy: req.user._id,
    });

    const adminIds = [];

    for (const email of adminEmails) {
      let adminUser = await User.findOne({ email });

      if (!adminUser) {
        const password = generateDefaultPassword();
        adminUser = await User.create({
          email,
          password,
          userType: USER_TYPES.HotelAdmin,
        });

        await sendEmail(
          email,
          "Your Hotel Admin Account Details",
          createHotelTemplate(email, password)
        );
      }

      adminIds.push(adminUser._id);

      await HotelAdminDetail.updateOne(
        { hotelId: hotel._id, userId: adminUser._id },
        { hotelId: hotel._id, userId: adminUser._id },
        { upsert: true }
      );
    }

    hotel.adminIds = adminIds;
    await hotel.save();

    return successResponse(
      res,
      {
        message: "Hotel and admins created successfully",
        hotel,
      },
      201
    );
  } catch (error) {
    console.error("Error creating hotel:", error);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return errorResponse(
        res,
        {
          message: `Duplicate value for ${duplicateField}. It must be unique.`,
        },
        400
      );
    }

    return errorResponse(res, { message: "Server error" }, 500, error);
  }
};

// ✅ Update Hotel (can add/remove admins)
export const updateHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const updateData = req.body;

    // ✅ Run schema validators (including enum check)
    const hotel = await Hotel.findByIdAndUpdate(hotelId, updateData, {
      new: true,
      runValidators: true, // 👈 Ensures enum validation runs
    });

    if (!hotel) {
      return errorResponse(res, { message: "Hotel not found" }, 404);
    }

    // ✅ If hotel deactivated — disable all users linked to it
    if (updateData.status === "Inactive") {
      await User.updateMany({ hotelId }, { $set: { isActive: false } });
    }

    // ✅ If hotel reactivated — enable them again
    if (updateData.status === "Active") {
      await User.updateMany({ hotelId }, { $set: { isActive: true } });
    }

    return successResponse(
      res,
      { message: "Hotel updated successfully", hotel },
      200
    );
  } catch (error) {
    console.error("Error updating hotel:", error);

    // ✅ Handle invalid enum or duplicate field errors gracefully
    if (error.name === "ValidationError") {
      return errorResponse(res, { message: error.message }, 400);
    }

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return errorResponse(
        res,
        {
          message: `Duplicate value for ${duplicateField}. It must be unique.`,
        },
        400
      );
    }

    return errorResponse(res, { message: "Server error" }, 500, error);
  }
};

// ✅ Delete Hotel
export const deleteHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return errorResponse(res, { message: "Hotel not found" }, 404);

    if (hotel.adminIds.length > 0) {
      await HotelAdminDetail.deleteMany({ hotelId });
    }

    await Hotel.findByIdAndDelete(hotelId);

    return successResponse(res, {
      message: "Hotel deleted successfully",
      deletedHotelId: hotelId,
    });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    return errorResponse(res, { message: "Server error" }, 500, error);
  }
};

// ✅ Get All Hotels
export const getHotel = async (req, res) => {
  try {
    const { skip, limit, searchTerm, page } = paginationHelper(req.query);

    const matchStage = {};
    if (searchTerm) {
      matchStage.$or = [
        { hotelName: { $regex: searchTerm, $options: "i" } },
        { city: { $regex: searchTerm, $options: "i" } },
        { state: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const hotels = await Hotel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "adminIds",
          foreignField: "_id",
          as: "adminDetails",
        },
      },
      {
        $project: {
          hotelName: 1,
          city: 1,
          state: 1,
          country: 1,
          website: 1,
          phone: 1,
          allowSuperAdminAccess: 1,
          status: 1,
          adminDetails: { _id: 1, email: 1 },
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalHotels = await Hotel.countDocuments(matchStage);

    return successResponse(res, {
      data: hotels,
      pagination: {
        total: totalHotels,
        page,
        limit,
        totalPages: Math.ceil(totalHotels / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return errorResponse(res, { message: "Server error" }, 500, error);
  }
};

// ✅ Get Single Hotel
export const getHotelById = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findById(hotelId)
      .populate("adminIds", "email userType")
      .lean();

    if (!hotel) return errorResponse(res, { message: "Hotel not found" }, 404);

    return successResponse(res, {
      message: "Hotel details fetched successfully",
      hotel,
    });
  } catch (error) {
    console.error("Error fetching hotel by ID:", error);
    return errorResponse(res, { message: "Server error" }, 500, error);
  }
};
