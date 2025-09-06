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

export const inviteStaff = async (req, resp) => {
  try {
    const result = await inviteStaffValidator.validateAsync(req.body);
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      employementType,
      department,
    } = result;
    const invitedBy = req.user._id;
    const hotelId = req.user._id;
    const password = generateDefaultPassword();

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
      employementType,
      department,
      firstName,
      lastName,
      HotelId: [hotelId], // array
      token: token,
    });
    await newStaff.save();
    const emailHtml = createStaffInviteTemplate(
      firstName,
      lastName,
      email,
      token,
      employementType,
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

export const verifyStaffAccount = async (req, resp) => {
  try {
    const { token } = req.body;

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
      isPasswordChange:user.isPasswordChange
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
    const result =await resetPasswordWithTokenValidator.validateAsync(req.body)
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
