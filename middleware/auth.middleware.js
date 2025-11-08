import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import { errorResponse } from "../helpers/common.helpers.js";
import { USER_TYPES } from "../constants/common.constants.js";
import StaffDetail from "../models/staffDetail.model.js";
import HotelAdminDetail from "../models/hotelAdminDetail.model.js";
import Hotel from "../models/hotel.model.js";

dotenv.config();

export const authorize = (userTypes = []) => {
  return async (req, res, next) => {
    console.log("🔐 Authorization triggered", req.headers);
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return errorResponse(res, { message: "No token provided" }, 401);
      }
      let hotelId = req.headers.hotelid; // Added line to get hotelId from request headers
      if (!hotelId) {
        return errorResponse(
          res,
          { message: "No hotel Selected, Please Select hotel" },
          400
        );
      }
      const token = authHeader.split(" ")[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Fetch fresh user from DB
      const user = await User.findById(payload.id);
      if (!user) return errorResponse(res, { message: "User not found" }, 401);

      // ✅ Email verification for staff
      if (user.userType === USER_TYPES.Staff && !user.isEmailVerified) {
        return errorResponse(
          res,
          { message: "Email verification pending" },
          401
        );
      }

      // ✅ Attach hotel info
      if (user.selectedHotelId) {
        const hotel = await Hotel.findById(
          user.selectedHotelId,
          "hotelName allowedSuperAdmins"
        );
        if (hotel) {
          req.hotelName = hotel.hotelName;

          // ✅ Determine if SuperAdmin can view full data or masked data
          if (user.userType === USER_TYPES.SuperAdmin) {
            const hasAccess = hotel.allowSuperAdminAccess?.some(
              (adminId) => adminId.toString() === user._id.toString()
            );
            req.isMasked = !hasAccess; // Masked if not allowed
          } else {
            req.isMasked = false;
          }
        }
      } else {
        req.isMasked = false;
      }

      req.user = user;
      req.hotelId = user.selectedHotelId;

      // ✅ Token validation for non-admins
      if (
        ![USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin].includes(user.userType)
      ) {
        if (!user.jwtToken || user.jwtToken !== token) {
          return errorResponse(
            res,
            { message: "You have been logged out" },
            401
          );
        }
      }

      // ✅ Role-based access
      if (userTypes.length > 0 && !userTypes.includes(user.userType)) {
        return errorResponse(res, { message: "Access denied" }, 403);
      }

      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return errorResponse(res, { message: "Invalid token" }, 401);
      } else if (error.name === "TokenExpiredError") {
        return errorResponse(res, { message: "Session expired" }, 401);
      }
      return errorResponse(
        res,
        { message: "Server error", error: error.message },
        500
      );
    }
  };
};

export const authorizeBasic = (userTypes = []) => {
  return async (req, res, next) => {
    console.log("🔐 Basic Authorization triggered", req.headers);
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return errorResponse(res, { message: "No token provided" }, 401);
      }

      const token = authHeader.split(" ")[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Attach user info
      req.userId = payload.id;
      req.userRole = payload.userRole;

      const user = await User.findById(req.userId);
      if (!user) {
        return errorResponse(
          res,
          { message: "Unauthorized, User not found" },
          401
        );
      }

      // ✅ Staff email verification check
      if (user.userType === USER_TYPES.Staff && !user.isEmailVerified) {
        return errorResponse(
          res,
          { message: "Email verification pending" },
          401
        );
      }

      // ✅ Attach related details (if applicable)
      if (user.userType === USER_TYPES.HotelAdmin) {
        const hotelAdminDetail = await HotelAdminDetail.findOne({
          userId: user._id,
        });
        if (hotelAdminDetail) req.hotelAdminDetail = hotelAdminDetail;
      }

      if (user.userType === USER_TYPES.Staff) {
        const staffDetail = await StaffDetail.findOne({ userId: user._id });
        if (staffDetail) req.staffDetail = staffDetail;
      }

      // ✅ Attach user object
      req.user = user;

      // ✅ Token validation — SuperAdmin & HotelAdmin skip logout validation (for switching hotels)
      if (
        ![USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin].includes(user.userType)
      ) {
        if (!user.jwtToken || user.jwtToken !== token) {
          return errorResponse(
            res,
            { message: "You have been logged out" },
            401
          );
        }
      }

      // ✅ Role-based access
      if (userTypes.length > 0 && !userTypes.includes(user.userType)) {
        return errorResponse(
          res,
          { message: "Access denied. Insufficient permissions." },
          403
        );
      }

      console.log(`✅ Authorized ${user.userType} (User ID: ${user._id})`);
      next();
    } catch (error) {
      console.error("❌ Basic Authorization Error:", error);

      if (error.name === "JsonWebTokenError") {
        return errorResponse(res, { message: "Invalid token" }, 401);
      } else if (error.name === "TokenExpiredError") {
        return errorResponse(res, { message: "Session expired" }, 401);
      }

      return errorResponse(
        res,
        { message: "Server error", error: error.message },
        500
      );
    }
  };
};
