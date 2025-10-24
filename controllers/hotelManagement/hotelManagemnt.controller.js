// import Hotel from "../models/hotel.model.js";
// import User from "../models/user.model.js";
import Hotel from "../../models/hotel.model.js";
import mongoose from "mongoose";
import {
  errorResponse,
  generateDefaultPassword,
  successResponse,
} from "../../helpers/common.helpers.js";
import { USER_TYPES } from "../../constants/common.constants.js";
import User from "../../models/user.model.js";
import { sendEmail } from "../../helpers/nodemail.helper.js";
import { createHotelTemplate } from "../../MailTemplate/HotelMail.js";
import HotelAdminDetail from "../../models/hotelAdminDetail.model.js";
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
      adminEmail,
    } = req.body;

    // ✅ Check if email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return errorResponse(
        res,
        {
          message: "Email is already registered. Please use a different email.",
        },
        400
      );
    }

    // ✅ Create Hotel
    const hotel = new Hotel({
      hotelName,
      website,
      address1,
      address2,
      city,
      state,
      zipcode,
      country,
      phone,
    });
    await hotel.save();

    // ✅ Generate password & create admin user
    const generatedPassword = generateDefaultPassword();
    const adminUser = new User({
      email: adminEmail,
      password: generatedPassword,
      userType: USER_TYPES.HOTEL_ADMIN,
    });
    await adminUser.save();

    // ✅ Link admin to hotel
    hotel.adminIds.push(adminUser._id);
    await hotel.save();
    const newHotelAdminDetail = new HotelAdminDetail({
      hotelId: hotel._id,
      userId: adminUser._id,
    });
    await newHotelAdminDetail.save();
    // ✅ Prepare and send email
    const mailSubject = "Regarding Hotel Creation";
    const htmlTemplate = createHotelTemplate(adminEmail, generatedPassword);
    await sendEmail(adminEmail, mailSubject, htmlTemplate);

    // ✅ Success Response
    return successResponse(
      res,
      {
        message: "Hotel and Admin created successfully",
        hotelId: hotel._id,
        adminId: adminUser._id,
      },
      201
    );
  } catch (error) {
    console.error("Error creating hotel:", error);
    return errorResponse(res, { message: "Server error" }, 500, error);
  }
};

export const updateHotel = async (req, res) => {
  try {
    const { hotelId } = req.params; // hotelId comes from URL params
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
    } = req.body;

    // ✅ Validate hotelId
    if (!hotelId) {
      return errorResponse(res, { message: "Hotel ID is required" }, 400);
    }

    // ✅ Find hotel by ID
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return errorResponse(res, { message: "Hotel not found" }, 404);
    }

    // ✅ Overwrite all fields (even if empty)
    hotel.hotelName = hotelName || "";
    hotel.website = website || "";
    hotel.address1 = address1 || "";
    hotel.address2 = address2 || "";
    hotel.city = city || "";
    hotel.state = state || "";
    hotel.zipcode = zipcode || "";
    hotel.country = country || "";
    hotel.phone = phone || "";

    await hotel.save();

    return successResponse(res, {
      message: "Hotel details updated successfully",
      hotel,
    });
  } catch (error) {
    console.error("Error updating hotel:", error);
    return errorResponse(res, { message: "Server error" }, 500, error);
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    // ✅ Validate hotelId
    if (!hotelId) {
      return errorResponse(res, { message: "Hotel ID is required" }, 400);
    }

    // ✅ Find the hotel
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return errorResponse(res, { message: "Hotel not found" }, 404);
    }

    // ✅ Optional: Remove associated admin users (if needed)
    if (hotel.adminIds && hotel.adminIds.length > 0) {
      await User.deleteMany({ _id: { $in: hotel.adminIds } });
    }

    // ✅ Delete the hotel
    await Hotel.findByIdAndDelete(hotelId);
    await HotelAdminDetail.deleteMany({ hotelId: { $in: hotelId } });
    return successResponse(res, {
      message: "Hotel deleted successfully",
      deletedHotelId: hotelId,
    });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    return errorResponse(res, { message: "Server error" }, 500, error);
  }
};

// export const getHotel = async (req, res) => {
//   try {
//     const { skip, limit, searchTerm, page } = paginationHelper(req.query);

//     const matchStage = {};
//     if (searchTerm) {
//       matchStage.$or = [
//         { hotelName: { $regex: searchTerm, $options: "i" } },
//         { city: { $regex: searchTerm, $options: "i" } },
//         { state: { $regex: searchTerm, $options: "i" } },
//       ];
//     }

//     const hotels = await Hotel.aggregate([
//       { $match: matchStage },
//       // {
//       //   $project: {
//       //     _id: 1,
//       //     hotelName: 1,
//       //     city: 1,
//       //     state: 1,
//       //   },
//       // },
//       { $skip: skip },
//       { $limit: limit },
//     ]);

//     // ✅ Get total count for pagination
//     const totalHotels = await Hotel.countDocuments(matchStage);

//     return successResponse(
//       res,
//       {
//         data: hotels,
//         pagination: {
//           total: totalHotels,
//           page,
//           limit,
//           totalPages: Math.ceil(totalHotels / limit),
//         },
//       },
//       200
//     );
//   } catch (error) {
//     console.error("Error fetching hotels:", error);
//     return errorResponse(res, { message: "Server error" }, 500, error);
//   }
// };

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

      // 🔍 Join with Admin collection
      {
        $lookup: {
          from: "users",
          localField: "adminIds", // ✅ match your schema
          foreignField: "_id",
          as: "adminDetails",
        },
      },

      // 🧩 Only include _id and email from the admin
      {
        $project: {
          _id: 1,
          hotelName: 1,
          city: 1,
          state: 1,
          address1: 1,
          address2: 1,
          zipcode: 1,
          country: 1,
          phone: 1,
          website: 1,
          admin: {
            $map: {
              input: "$adminDetails",
              as: "a",
              in: { _id: "$$a._id", email: "$$a.email" },
            },
          },
        },
      },

      { $skip: skip },
      { $limit: limit },
    ]);

    // ✅ Get total count for pagination
    const totalHotels = await Hotel.countDocuments(matchStage);

    return successResponse(
      res,
      {
        data: hotels,
        pagination: {
          total: totalHotels,
          page,
          limit,
          totalPages: Math.ceil(totalHotels / limit),
        },
      },
      200
    );
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return errorResponse(res, { message: "Server error" }, 500, error);
  }
};

export const getHotelById = async (req, res) => {
  try {
    const { hotelId } = req.params;

    if (!hotelId) {
      return errorResponse(res, { message: "Hotel ID is required" }, 400);
    }

    const hotelDetails = await Hotel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(hotelId) },
      },
      {
        $lookup: {
          from: "hoteladmindetails", // collection name in MongoDB (check in DB)
          localField: "_id",
          foreignField: "hotelId",
          as: "adminDetails",
        },
      },
      { $unwind: { path: "$adminDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "adminDetails.userId",
          foreignField: "_id",
          as: "adminUser",
        },
      },
      { $unwind: { path: "$adminUser", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          hotelName: { $first: "$hotelName" },
          website: { $first: "$website" },
          address1: { $first: "$address1" },
          address2: { $first: "$address2" },
          city: { $first: "$city" },
          state: { $first: "$state" },
          zipcode: { $first: "$zipcode" },
          country: { $first: "$country" },
          phone: { $first: "$phone" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          admins: {
            $push: {
              _id: "$adminUser._id",
              email: "$adminUser.email",
              userType: "$adminUser.userType",
              createdAt: "$adminUser.createdAt",
            },
          },
        },
      },
    ]);

    if (!hotelDetails.length) {
      return errorResponse(res, { message: "Hotel not found" }, 404);
    }

    return successResponse(
      res,
      {
        message: "Hotel details fetched successfully",
        hotel: hotelDetails[0],
      },
      200
    );
  } catch (error) {
    console.error("Error fetching hotel by ID:", error);
    return errorResponse(res, { message: "Server error" }, 500, error);
  }
};
