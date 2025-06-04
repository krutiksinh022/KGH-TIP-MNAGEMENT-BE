import { USER_TYPES } from "../../constants/common.constants.js";
import {
  errorResponse,
  generateDefaultPassword,
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

    for (const email of admin) {
      const user = await User.findOne({ email });
      if (user) {
        return errorResponse(
          res,
          {
            success: false,
            message: `Admin with email ${email} already register`,
          },
          404
        );
      }
    }

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
    let adminIds = [];
    let createdAdmin = [];
    for (const email of admin) {
      const defaultPassword = generateDefaultPassword();
      const createSuperAdmin = new User({
        email,
        userType: USER_TYPES.HOTEL_ADMIN,
        password: defaultPassword,
      });
      const createNewAdmin = await createSuperAdmin.save();
      adminIds.push(createNewAdmin._id);
      createdAdmin.push({
        email: createNewAdmin.email,
        password: defaultPassword,
      });
    }
    const newHotel = new Hotel({
      hotelName,
      address,
      state,
      city,
      phoneNumber,
      admin: adminIds,
      country,
      website,
    });
    const savedHotel=await newHotel.save();
    //send email to admins
    await Promise.all(
      createdAdmin.map(({ email, password }) =>
        sendEmail(
          email,
          "Your Hotel Admin Account Credentials",
          `Welcome to the hotel management system.\n\nYour login credentials:\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after logging in.`
        )
      )
    );
    
    for (const admins of savedHotel.admin){
        const newHotelAdminDetail=await new HotelAdminDetail({
            hotelId: savedHotel._id,
            adminId: admins,
        })
        newHotelAdminDetail.save();
    }

    return res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      data: newHotel,
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
