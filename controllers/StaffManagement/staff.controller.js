import { USER_TYPES } from "../../constants/common.constants.js";
import jwt from "jsonwebtoken";
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
import Hotel from "../../models/hotel.model.js"; // ✅ Add this import
import { inviteStaffValidator } from "../../validators/staff.validators.js";
import mongoose from "mongoose";

// ✅ Invite new staff
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
    const hotelId = req.hotelId; // ✅ correct hotelId from header

    // Check if hotelId exists (for admin)
    if (!hotelId) {
      return errorResponse(resp, { message: "Hotel ID is required" }, 400);
    }

    // Validate hotel exists and is active
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return errorResponse(resp, { message: "Hotel not found" }, 404);
    }

    if (hotel.status == "Inactive") {
      return errorResponse(resp, { message: "Hotel is inactive" }, 403);
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(
        resp,
        { message: "User with this email already exists" },
        401
      );
    }

    // const password = generateDefaultPassword();
    const password = "Admin@123";

    const newUser = new User({
      name: firstName,
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
      hotelIds: [hotelId],
      token,
    });

    await newStaff.save();

    console.log("✅ New Staff Created:", firstName, lastName, email);

    // Send email
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
    console.error("❌ Invite Staff Error:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

// ✅ Get all staff for current hotel
export const getAllStaff = async (req, resp) => {
  try {
    const hotelId = req.hotelId;

    if (!hotelId) {
      return errorResponse(resp, { message: "Hotel ID is required" }, 400);
    }

    const staffList = await StaffDetails.aggregate([
      { $match: { hotelIds: { $in: [new mongoose.Types.ObjectId(hotelId)] } } },
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
          isActive: 1,
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
    console.error("❌ Get All Staff Error:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

// ✅ Get single staff member by ID
export const getStaffById = async (req, resp) => {
  try {
    const hotelId = req.hotelId;
    const { staffId } = req.params;

    if (!hotelId) {
      return errorResponse(resp, { message: "Hotel ID is required" }, 400);
    }

    if (!staffId) {
      return errorResponse(resp, { message: "Staff ID is required" }, 400);
    }

    const staff = await StaffDetails.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(staffId),
          hotelIds: { $in: [new mongoose.Types.ObjectId(hotelId)] },
        },
      },
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
      {
        $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true },
      },
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
      { $limit: 1 },
    ]);

    if (!staff || staff.length === 0) {
      return errorResponse(resp, { message: "Staff not found" }, 404);
    }

    return successResponse(resp, {
      message: "Staff fetched successfully",
      data: staff[0],
    });
  } catch (error) {
    console.error("❌ Get Staff By ID Error:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

// ✅ Update staff details
export const updateStaff = async (req, resp) => {
  try {
    const { id } = req.params;
    const result = await inviteStaffValidator.validateAsync(req.body);

    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      employmentType,
      department,
    } = result;

    const staff = await StaffDetails.findById(id);
    if (!staff) {
      return errorResponse(resp, { message: "Staff not found" }, 404);
    }

    if (email && email !== staff.email) {
      const existingUser = await User.findOne({ email });
      if (
        existingUser &&
        existingUser._id.toString() !== staff.userId.toString()
      ) {
        return errorResponse(resp, { message: "Email already exists" }, 400);
      }
    }

    staff.firstName = firstName || staff.firstName;
    staff.lastName = lastName || staff.lastName;
    staff.phoneNumber = phoneNumber || staff.phoneNumber;
    staff.email = email || staff.email;
    staff.employmentType = employmentType || staff.employmentType;
    staff.department = department || staff.department;
    await staff.save();

    await User.findByIdAndUpdate(staff.userId, { name: firstName, email });

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
    console.error("❌ Update Staff Error:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

// ✅ Verify staff account
export const verifyStaffAccount = async (req, resp) => {
  try {
    const { token } = req.query;
    if (!token) {
      return errorResponse(resp, { message: "Token is required" }, 400);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id || decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(resp, { message: "User not found" }, 404);
    }

    // Check if staff’s hotel is active
    const staff = await StaffDetails.findOne({ userId }).populate("hotelIds");
    if (!staff) {
      return errorResponse(resp, { message: "Staff details not found" }, 404);
    }

    const hasActiveHotel = staff.hotelIds.some(
      (hotel) => hotel.isActive === true
    );
    if (!hasActiveHotel) {
      return errorResponse(
        resp,
        { message: "Hotel is inactive. Cannot verify account." },
        403
      );
    }

    user.isEmailVerified = true;
    await user.save();

    return successResponse(resp, {
      message: "User verified successfully!",
      data: {
        _id: user._id,
        email: user.email,
        isPasswordChange: user.isPasswordChange,
      },
    });
  } catch (error) {
    console.error("❌ Verify Staff Error:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

export const revokeStaffInvite = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await StaffDetails.findById(staffId);
    if (!staff) return errorResponse(res, { message: "Staff not found" }, 404);

    // Soft delete (mark inactive)
    staff.isActive = false;
    await staff.save();

    // Optionally, also disable their user account
    await User.findByIdAndUpdate(staff.userId, { isActive: false });

    return successResponse(res, {
      message: "Staff invitation revoked successfully",
    });
  } catch (err) {
    console.error("Revoke staff error:", err);
    return errorResponse(res, { message: "Server error" }, 500, err);
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
