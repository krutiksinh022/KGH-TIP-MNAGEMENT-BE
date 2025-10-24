import { USER_TYPES } from "../../constants/common.constants.js";

import jwt, { decode } from "jsonwebtoken";

import {
  errorResponse,
  generateDefaultPassword,
  generateJwtToken,
  successResponse,
} from "../../helpers/common.helpers.js";
import { sendEmail } from "../../helpers/nodemail.helper.js";
import { createStaffInviteTemplate } from "../../MailTemplate/staffInvitationMail.js";
import StaffDetails from "../../models/staffDetail.model.js";
import User from "../../models/user.model.js";
import { inviteStaffValidator } from "../../validators/staff.validators.js";
import { resetPasswordWithTokenValidator } from "../../validators/auth.validators.js";
import mongoose from "mongoose";

export const inviteStaff = async (req, resp) => {
  try {
    const result = await inviteStaffValidator.validateAsync(req.body);
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      department,
      employmentType,
    } = result;
    const invitedBy = req.user._id;
    const hotelId = req.user._id;
    // const password = generateDefaultPassword();
    const password = "Admin@123";

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(
        resp,
        { message: "User with this email already exists" },
        401
      );
    }

    const newUser = new User({
      name: `${firstName}`,
      email,
      password,
      userType: USER_TYPES.Staff,
    });
    await newUser.save();
    const token = generateJwtToken(newUser);
    const newStaff = new StaffDetails({
      userId: newUser._id,
      invitedBy,
      phoneNumber,
      email,
      employmentType,
      department,
      firstName,
      lastName,
      HotelId: [hotelId], // array
      token: token,
    });
    await newStaff.save();
    console.log(
      "New Staff Created: ",
      firstName,
      lastName,
      email,
      token,
      employmentType,
      department
    );
    const emailHtml = createStaffInviteTemplate(
      firstName,
      lastName,
      email,
      token,
      employmentType,
      department
    );

    await sendEmail(email, "Hotel Staff Invitation", emailHtml);
    return successResponse(resp, {
      message: "Staff invited successfully",
      staffId: newStaff._id,
      userId: newUser._id,
    });
  } catch (error) {
    console.log(error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

export const getAllStaff = async (req, resp) => {
  try {
    const hotelId = req.user._id;

    const staffList = await StaffDetails.aggregate([
      // Match staff by hotel ID
      {
        $match: {
          HotelId: { $in: [new mongoose.Types.ObjectId(hotelId)] },
        },
      },

      // Lookup Department name
      {
        $lookup: {
          from: "departments", // collection name (lowercase plural of model)
          localField: "department",
          foreignField: "_id",
          as: "departmentInfo",
        },
      },
      {
        $unwind: { path: "$departmentInfo", preserveNullAndEmptyArrays: true },
      },

      // Lookup User details
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },

      // Shape the final data
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phoneNumber: 1,
          employmentType: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          "department._id": "$departmentInfo._id",
          "department.name": "$departmentInfo.departmentName",
          "userId._id": "$userInfo._id",
          "userId.name": "$userInfo.name",
          "userId.email": "$userInfo.email",
          "userId.userType": "$userInfo.userType",
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return successResponse(resp, {
      message: "Staff list fetched successfully",
      data: staffList,
    });
  } catch (error) {
    console.error("Error fetching staff list:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};
export const updateStaff = async (req, resp) => {
  try {
    const { id } = req.params;

    // Validate body using the same validator (you can create a separate one if needed)
    const result = await inviteStaffValidator.validateAsync(req.body);
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      employmentType,
      department,
    } = result;

    // Check if staff exists
    const staff = await StaffDetails.findById(id);
    if (!staff) {
      return errorResponse(resp, { message: "Staff not found" }, 404);
    }

    // Check if email is being updated to an existing user email
    if (email && email !== staff.email) {
      const existingUser = await User.findOne({ email });
      if (
        existingUser &&
        existingUser._id.toString() !== staff.userId.toString()
      ) {
        return errorResponse(resp, { message: "Email already exists" }, 400);
      }
    }

    // Update staff fields
    staff.firstName = firstName || staff.firstName;
    staff.lastName = lastName || staff.lastName;
    staff.phoneNumber = phoneNumber || staff.phoneNumber;
    staff.email = email || staff.email;
    staff.employmentType = employmentType || staff.employmentType;
    staff.department = department || staff.department;

    await staff.save();

    // Update linked User document as well
    await User.findByIdAndUpdate(staff.userId, {
      name: firstName,
      email,
    });

    // Re-fetch updated staff with aggregation (same structure as getAllStaff)
    const updatedStaff = await StaffDetails.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "departmentInfo",
        },
      },
      {
        $unwind: { path: "$departmentInfo", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phoneNumber: 1,
          employmentType: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          "department._id": "$departmentInfo._id",
          "department.name": "$departmentInfo.departmentName",
          "userId._id": "$userInfo._id",
          "userId.name": "$userInfo.name",
          "userId.email": "$userInfo.email",
          "userId.userType": "$userInfo.userType",
        },
      },
    ]);

    return successResponse(resp, {
      message: "Staff updated successfully",
      data: updatedStaff[0],
    });
  } catch (error) {
    console.error("Error updating staff:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};
export const verifyStaffAccount = async (req, resp) => {
  try {
    const { token } = req.query;

    if (!token) {
      return errorResponse(resp, { message: "Token is required" }, 400);
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded will have userId or _id depending on your generateJwtToken helper
    const userId = decoded._id || decoded.id;
    if (!userId) {
      return errorResponse(resp, { message: "Invalid token payload" }, 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(resp, { message: "user not found" }, 400);
    }
    user.isEmailVerified = true;
    await user.save();
    const userData = {
      _id: user._id,
      email: user.email,
      isPasswordChange: user.isPasswordChange,
    };
    return successResponse(
      resp,
      {
        message: "user verified succesfully !",
        data: userData,
      },
      200
    );
  } catch (error) {
    console.log(error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

export const resetPassword = async (req, resp) => {
  try {
    const result = await resetPasswordWithTokenValidator.validateAsync(
      req.body
    );
    const { token, password } = result;

    if (!token) {
      return errorResponse(resp, { message: "Token is required" }, 400);
    }

    // ✅ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return errorResponse(resp, { message: "Invalid or expired token" }, 400);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(resp, { message: "User not found" }, 404);
    }

    // ✅ Update password
    user.password = password; // pre-save hook will hash it
    user.isPasswordChange = true;

    user.jwtToken = null; // optional: clear token so it can't be reused
    await user.save();

    return successResponse(
      resp,
      { message: "Password changed successfully" },
      200
    );
  } catch (error) {
    return errorResponse(resp, { message: "server error" }, 500, error);
  }
};
