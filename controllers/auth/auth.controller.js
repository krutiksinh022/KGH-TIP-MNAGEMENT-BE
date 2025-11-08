import { USER_TYPES } from "../../constants/common.constants.js";
import {
  errorResponse,
  generateJwtToken,
  generateRefreshToken,
  successResponse,
} from "../../helpers/common.helpers.js";
import { sendEmail } from "../../helpers/nodemail.helper.js";
import ForgotPasswordRequest from "../../models/forgotPasswordRequest.model.js";
import User from "../../models/user.model.js";
import {
  changePasswordValidator,
  forgotPasswordValidator,
  loginValidator,
  resetPasswordValidator,
  verifyOtpValidator,
} from "../../validators/auth.validators.js";
import jwt from "jsonwebtoken";

export const login = async (req, resp) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).populate(
      "hotelId",
      "status"
    );

    if (!user) {
      return errorResponse(resp, { message: "User not found" }, 404);
    }
    // ✅ If the user account itself is inactive
    if (!user.isActive) {
      return errorResponse(resp, { message: "Your account is inactive" }, 403);
    }

    // ✅ If hotel is inactive (for hotel admins or staff)
    if (
      (user.userType === USER_TYPES.HotelAdmin ||
        user.userType === USER_TYPES.Staff) &&
      user.hotelId &&
      user.hotelId.status === "Inactive"
    ) {
      return errorResponse(
        resp,
        { message: "This hotel is inactive. Access denied." },
        403
      );
    }

    if (user.userType === USER_TYPES.Staff && !user.isEmailVerified) {
      return errorResponse(resp, { message: "Email not verified" }, 401);
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return errorResponse(resp, { message: "Invalid credentials" }, 401);
    }

    const accessToken = generateJwtToken(user, "1hr");
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    resp.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      profilePhoto: user.profilePhoto,
    };

    return resp.status(200).json({
      success: true,
      message: "Login successful",
      token: accessToken,
      data: userData,
    });
  } catch (error) {
    console.error("Error in login:", error);
    return errorResponse(resp, { message: "Internal Server Error" }, 500);
  }
};
export const refreshAccessToken = async (req, resp) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return errorResponse(resp, { message: "No refresh token found" }, 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return errorResponse(resp, { message: "Invalid refresh token" }, 403);
    }

    const newAccessToken = generateJwtToken(user, "15m");
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    resp.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return resp.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return errorResponse(resp, { message: "Invalid or expired token" }, 401);
  }
};

export const logOut = async (req, resp) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return errorResponse(resp, { message: "Unauthorized" }, 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(resp, { message: "User not found" }, 404);
    }

    user.refreshToken = null;
    await user.save();

    resp.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return successResponse(resp, { message: "Logout successful" }, 200);
  } catch (error) {
    console.error("Error in logout:", error);
    return errorResponse(resp, { message: "Internal Server Error" }, 500);
  }
};

export const forgotPassword = async (req, resp) => {
  try {
    const result = await forgotPasswordValidator.validateAsync(req.body);
    const { email } = result;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse(
        resp,
        { success: false, message: "User not found" },
        404
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const alreadyRequested = await ForgotPasswordRequest.findOne({
      userId: user._id,
    });
    if (alreadyRequested) {
      alreadyRequested.otp = otp;
      await alreadyRequested.save();
    } else {
      const forgotPasswordRequest = new ForgotPasswordRequest({
        userId: user._id,
        otp: otp,
        email: user.email,
      });
      await forgotPasswordRequest.save();
    }
    await sendEmail(
      user.email,
      "Password Reset OTP",
      `Your OTP for password reset is: ${otp}`
    );
    return successResponse(
      resp,
      { success: true, message: "OTP sent to your email" },
      200
    );
  } catch (error) {
    console.log("Error in forgotPassword controller:", error);
    return errorResponse(
      resp,
      { success: false, message: "Internal Server Error" },
      500,
      error
    );
  }
};

export const verifyOtp = async (req, resp) => {
  try {
    const result = await verifyOtpValidator.validateAsync(req.body);
    const { email, otp } = result;
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(
        resp,
        { success: false, message: "User not found" },
        404
      );
    }
    const forgotPasswordRequest = await ForgotPasswordRequest.findOne({
      userId: user._id,
    });
    if (!forgotPasswordRequest) {
      return errorResponse(
        resp,
        { success: false, message: "No password reset request found" },
        404
      );
    }
    if (forgotPasswordRequest.otp !== otp) {
      return errorResponse(
        resp,
        { success: false, message: "Invalid OTP" },
        400
      );
    }
    forgotPasswordRequest.isVerified = true;
    await forgotPasswordRequest.save();

    return successResponse(
      resp,
      { success: true, message: "OTP verified successfully" },
      200
    );
  } catch (error) {
    console.log("Error in verifyOtp controller:", error);
    return errorResponse(
      resp,
      { success: false, message: "Internal Server Error" },
      500,
      error.message
    );
  }
};

export const resetPassword = async (req, rep) => {
  try {
    const result = await resetPasswordValidator.validateAsync(req.body);
    const { email, newPassword } = result;
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(
        rep,
        { success: false, message: "User not found" },
        404
      );
    }
    const forgotPasswordRequest = await ForgotPasswordRequest.findOne({
      userId: user._id,
      isVerified: true,
    });
    if (!forgotPasswordRequest) {
      return errorResponse(
        rep,
        { success: false, message: "No verified password reset request found" },
        404
      );
    }
    user.password = newPassword; // Assuming the User model has a method to hash the password
    await user.save();

    forgotPasswordRequest.isVerified = false; // Reset the request status
    await forgotPasswordRequest.save();
    return successResponse(
      rep,
      { success: true, message: "Password reset successfully" },
      200
    );
  } catch (error) {
    console.log("Error in resetPassword controller:", error);
    return errorResponse(
      rep,
      { success: false, message: "Internal Server Error" },
      500,
      error.message
    );
  }
};

export const changePassword = async (req, resp) => {
  try {
    const user = req.user;
    const { newPassword } = await changePasswordValidator.validateAsync(
      req.body
    );
    const findUser = await User.findById(user._id);
    if (!findUser) {
      return errorResponse(
        resp,
        { success: false, message: "User not found" },
        200
      );
    }
    findUser.password = newPassword;
    await findUser.save();
    return successResponse(
      resp,
      { success: true, message: "Password Updated Successfully !" },
      200
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      resp,
      {
        success: "false",
        message: "something went wrong",
      },
      500,
      error
    );
  }
};
