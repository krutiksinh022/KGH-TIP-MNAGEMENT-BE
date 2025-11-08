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
      admins = [], // array of { name, email }
      allowSuperAdminAccess = true,
      status = "Active",
    } = req.body;

    if (!Array.isArray(admins) || !admins.length) {
      return errorResponse(
        res,
        { message: "At least one admin detail (name & email) is required" },
        400
      );
    }

    // ✅ Create hotel first
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

    // ✅ Process each admin
    for (const admin of admins) {
      const { name, email } = admin;

      if (!email) continue; // skip invalid ones

      let adminUser = await User.findOne({ email });

      if (!adminUser) {
        const password = generateDefaultPassword();
        adminUser = await User.create({
          name: name?.trim() || null,
          email,
          password,
          userType: USER_TYPES.HotelAdmin,
          hotelId: hotel._id,
          isActive: true,
        });

        // ✅ Send email with credentials
        await sendEmail(
          email,
          "Your Hotel Admin Account Details",
          createHotelTemplate(email, password)
        );
      } else {
        // ✅ Update existing user's name or hotel association if needed
        adminUser.name = name || adminUser.name;
        adminUser.hotelId = hotel._id;
        adminUser.isActive = true;
        await adminUser.save();
      }

      adminIds.push(adminUser._id);

      await HotelAdminDetail.updateOne(
        { hotelId: hotel._id, userId: adminUser._id },
        { hotelId: hotel._id, userId: adminUser._id },
        { upsert: true }
      );
    }

    // ✅ Link admin IDs to the hotel
    hotel.adminIds = adminIds;
    await hotel.save();

    return successResponse(
      res,
      {
        message: "Hotel and admin users created successfully",
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
      status,
      adminDetails = [],
    } = req.body;

    // ✅ 1. Find the existing hotel
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return errorResponse(res, { message: "Hotel not found" }, 404);
    }

    // ✅ 2. Update hotel fields
    hotel.hotelName = hotelName ?? hotel.hotelName;
    hotel.website = website ?? hotel.website;
    hotel.address1 = address1 ?? hotel.address1;
    hotel.address2 = address2 ?? hotel.address2;
    hotel.city = city ?? hotel.city;
    hotel.state = state ?? hotel.state;
    hotel.zipcode = zipcode ?? hotel.zipcode;
    hotel.country = country ?? hotel.country;
    hotel.phone = phone ?? hotel.phone;
    hotel.status = status ?? hotel.status;

    // ✅ 3. Handle Admins update
    const existingAdmins = await HotelAdminDetail.find({ hotelId });
    const existingUserIds = existingAdmins.map((a) => a.userId.toString());

    const newAdminEmails = adminDetails.map((a) =>
      a.email.toLowerCase().trim()
    );
    const newAdminNames = adminDetails.map((a) => a.name.trim());

    // ✅ 3.1 Remove admins that no longer exist in frontend
    const adminsToRemove = existingAdmins.filter(
      (a) => !newAdminEmails.includes(a.email?.toLowerCase())
    );

    for (const admin of adminsToRemove) {
      await HotelAdminDetail.deleteOne({ hotelId, userId: admin.userId });
      await User.findByIdAndDelete(admin.userId); // Optional: fully delete user
    }

    const adminIds = [];

    // ✅ 3.2 Add or update current admins
    for (const admin of adminDetails) {
      let adminUser = await User.findOne({ email: admin.email });

      // ➕ Create new admin if not found
      if (!adminUser) {
        const password = generateDefaultPassword();
        adminUser = await User.create({
          name: admin.name,
          email: admin.email,
          password,
          userType: USER_TYPES.HotelAdmin,
          hotelId: hotel._id,
          isActive: hotel.status === "Active",
        });

        await sendEmail(
          admin.email,
          "Your Hotel Admin Account Details",
          createHotelTemplate(admin.email, password)
        );
      } else {
        // ✏️ Update name if changed
        if (adminUser.name !== admin.name) {
          adminUser.name = admin.name;
          await adminUser.save();
        }
      }

      adminIds.push(adminUser._id);

      // ✅ Ensure mapping in HotelAdminDetail
      await HotelAdminDetail.updateOne(
        { hotelId: hotel._id, userId: adminUser._id },
        { hotelId: hotel._id, userId: adminUser._id },
        { upsert: true }
      );
    }

    hotel.adminIds = adminIds;
    await hotel.save();

    // ✅ 4. Handle user status toggle if hotel deactivated/reactivated
    if (hotel.status === "Inactive") {
      await User.updateMany({ hotelId }, { $set: { isActive: false } });
    } else if (hotel.status === "Active") {
      await User.updateMany({ hotelId }, { $set: { isActive: true } });
    }

    // ✅ 5. Populate admin details for response
    const updatedHotel = await Hotel.findById(hotelId).populate({
      path: "adminIds",
      select: "name email",
      model: "User",
    });

    const adminDetailsResponse = updatedHotel.adminIds.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
    }));

    return successResponse(
      res,
      {
        message: "Hotel and admins updated successfully",
        hotel: {
          ...updatedHotel.toObject(),
          adminDetails: adminDetailsResponse,
        },
      },
      200
    );
  } catch (error) {
    console.error("Error updating hotel:", error);

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
          address1: 1,
          address2: 1,
          zipcode: 1,
          allowSuperAdminAccess: 1,
          status: 1,
          adminDetails: { _id: 1, email: 1, name: 1 },
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
