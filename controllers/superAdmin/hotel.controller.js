import mongoose from "mongoose";
import { USER_TYPES } from "../../constants/common.constants.js";
import {
  errorResponse,
  generateDefaultPassword,
  successResponse,
} from "../../helpers/common.helpers.js";
import { sendEmail } from "../../helpers/nodemail.helper.js";
import Hotel from "../../models/hotel.model.js";
import HotelAdminDetail from "../../models/hotelAdminDetail.modal.js";
import User from "../../models/user.model.js";
import { createHotelValidator } from "../../validators/hotel.validators.js";

export const createHotel = async (req, res) => {
  try {
    const result = await createHotelValidator.validateAsync(req.body);
    const {
      hotelName,
      address,
      state,
      city,
      phoneNumber,
      admin,
      country,
      website,
    } = result;

    // Check if any admin email already exists
    const existingAdmins = await User.find({ email: { $in: admin } });
    if (existingAdmins.length > 0) {
      return errorResponse(
        res,
        {
          success: false,
          message: `Admin with email ${existingAdmins[0].email} already registered`,
        },
        404
      );
    }

    // Check if hotel with the same phone number exists
    const existingHotel = await Hotel.findOne({
      phoneNumber: { $in: phoneNumber },
    });

    if (existingHotel) {
      return errorResponse(
        res,
        {
          success: false,
          message: `One or more phone numbers already registered with another hotel`,
        },
        409
      );
    }

    // Create hotel admin accounts
    const createdAdminAccounts = await Promise.all(
      admin.map(async (email) => {
        const password = generateDefaultPassword();
        const user = new User({
          email,
          userType: USER_TYPES.HOTEL_ADMIN,
          password,
        });
        const savedUser = await user.save();
        return {
          id: savedUser._id,
          email: savedUser.email,
          password,
        };
      })
    );

    // Create hotel with admin references
    const newHotel = new Hotel({
      hotelName,
      address,
      state,
      city,
      phoneNumber,
      admin: createdAdminAccounts.map((admin) => admin.id),
      country,
      website,
    });

    const savedHotel = await newHotel.save();

    // Send welcome emails to admins
    await Promise.all(
      createdAdminAccounts.map(({ email, password }) =>
        sendEmail(
          email,
          "Your Hotel Admin Account Credentials",
          `Welcome to the hotel management system.\n\nYour login credentials:\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after logging in.`
        )
      )
    );

    // Create HotelAdminDetail records
    await Promise.all(
      createdAdminAccounts.map(({ id }) =>
        new HotelAdminDetail({
          hotelId: savedHotel._id,
          adminId: id,
        }).save()
      )
    );

    return res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      data: savedHotel,
    });
  } catch (error) {
    console.error("Error in createHotel controller:", error);
    return errorResponse(
      res,
      { success: false, message: "Internal Server Error" },
      500,
      error
    );
  }
};

export const updateHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const findHotel = await Hotel.findById(hotelId).populate("admin");
    if (!findHotel) {
      return errorResponse(
        res,
        { success: false, message: "Hotel Not Found" },
        404
      );
    }

    const result = await createHotelValidator.validateAsync(req.body);
    const {
      hotelName,
      address,
      state,
      city,
      phoneNumber,
      admin: newAdminEmails,
      country,
      website,
    } = result;

    const oldAdminEmails = findHotel.admin.map((a) => a.email);

    const oldAdmins = await User.find({ email: { $in: newAdminEmails } });
    for (const oldAdmin of oldAdmins) {
      const findAdminHotel = await HotelAdminDetail.findOne({
        adminId: oldAdmin._id,
      });

      if (findAdminHotel && findAdminHotel.hotelId.toString() !== hotelId) {
        return errorResponse(
          res,
          {
            success: false,
            message: `${oldAdmin.email} is already registered with another hotel`,
          },
          409
        );
      }
    }

    const emailsToAdd = newAdminEmails.filter(
      (email) => !oldAdminEmails.includes(email)
    );
    const emailsToRemove = oldAdminEmails.filter(
      (email) => !newAdminEmails.includes(email)
    );

    const newAdminIds = [];

    for (const email of newAdminEmails) {
      let user = await User.findOne({ email });

      if (!user) {
        const password = generateDefaultPassword();
        const newUser = new User({
          email,
          password,
          userType: USER_TYPES.HOTEL_ADMIN,
        });
        user = await newUser.save();

        await sendEmail(
          email,
          "Your Hotel Admin Account Credentials",
          `Welcome to the hotel management system.\n\nYour login credentials:\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after logging in.`
        );
      }

      newAdminIds.push(user._id);

      const exists = await HotelAdminDetail.findOne({
        hotelId: hotelId,
        adminId: user._id,
      });

      if (!exists) {
        await HotelAdminDetail.create({ hotelId, adminId: user._id });
      }
    }

    for (const email of emailsToRemove) {
      const user = await User.findOne({ email });
      if (user) {
        await HotelAdminDetail.deleteOne({
          hotelId: hotelId,
          adminId: user._id,
        });

        await User.deleteOne({ _id: user._id });
      }
    }

    findHotel.hotelName = hotelName;
    findHotel.address = address;
    findHotel.state = state;
    findHotel.city = city;
    findHotel.phoneNumber = phoneNumber;
    findHotel.country = country;
    findHotel.website = website;
    findHotel.admin = newAdminIds;

    await findHotel.save();

    return res.status(200).json({
      success: true,
      message: "Hotel updated successfully",
      data: findHotel,
    });
  } catch (error) {
    console.error("Error in updateHotel:", error);
    return errorResponse(
      res,
      { success: false, message: "Something went wrong" },
      500,
      error.message
    );
  }
};

export const getHotel = async (req, res) => {
  try {
    const Hotels = await Hotel.aggregate([
      {
        $project: {
          hotelName: 1,
          city: 1,
          state: 1,
        },
      },
    ]);
    return successResponse(
      res,
      { success: true, message: "Hotel data fetch successfully", data: Hotels },
      200
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      res,
      { success: false, message: "Something went wrong" },
      500,
      error
    );
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const findHotel = await Hotel.findById(hotelId);
    if (!findHotel) {
      return errorResponse(
        res,
        {
          success: false,
          message: "Invalid Hotel ID. Hotel not found",
        },
        404
      );
    }

    // Get associated admin IDs
    const adminIds = findHotel.admin;

    // Delete admin users
    await User.deleteMany({ _id: { $in: adminIds } });

    // Delete hotel admin details
    await HotelAdminDetail.deleteMany({ hotelId });

    // Delete the hotel
    await Hotel.findByIdAndDelete(hotelId);

    return res.status(200).json({
      success: true,
      message: "Hotel and associated admins deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteHotel:", error);
    return errorResponse(
      res,
      {
        success: false,
        message: "Something went wrong while deleting hotel",
      },
      500,
      error.message
    );
  }
};

export const getSingleHotelId = async (req, resp) => {
  try {
    const { hotelId } = req.params;
    const hotel = await Hotel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(hotelId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "admin",
          foreignField: "_id",
          as: "adminData",
        },
      },
      {
        $addFields: {
          adminEmails: {
            $reduce: {
              input: "$adminData",
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  {
                    $cond: {
                      if: { $isArray: "$$this.email" },
                      then: "$$this.email",
                      else: ["$$this.email"], // wrap string in array
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          hotelName: 1,
          address: 1,
          state: 1,
          city: 1,
          phoneNumber: 1,
          country: 1,
          website: 1,
          admin: "$adminEmails",
        },
      },
    ]);

    if (!hotel || hotel.length === 0) {
      return errorResponse(
        resp,
        {
          success: false,
          message: "Hotel not found",
        },
        404
      );
    }

    return successResponse(
      resp,
      {
        success: true,
        message: "Hotel data fetched successfully",
        data: hotel[0],
      },
      200
    );
  } catch (error) {
    console.error(error);
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
