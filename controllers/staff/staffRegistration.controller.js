import { USER_TYPES } from "../../constants/common.constants.js";
import {
  errorResponse,
  generateJwtToken,
  successResponse,
} from "../../helpers/common.helpers.js";
import { sendEmail } from "../../helpers/nodemail.helper.js";
import StaffDetail from "../../models/staffDetail.model.js";
import User from "../../models/user.model.js";
import { registerStaffValidator } from "../../validators/staff.validators.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
dotenv.config();

export const registerStaff = async (req, res) => {
  try {
    const result = await registerStaffValidator.validateAsync(req.body);
    const { email, name, mobileNumber, password, city, state, address } =
      result;
    console.log(process.env);

    const findUser = await User.findOne({ email: email.toLowerCase() });
    if (findUser) {
      return errorResponse(
        res,
        { success: false, message: "staff already register with this email" },
        401
      );
    }

    const newUser = await new User({
      name,
      email: email.toLowerCase(),
      password,
      userType: USER_TYPES.Staff,
    });
    console.log(process.env);
    const savedUser = await newUser.save();
    const token = generateJwtToken(savedUser);
    const verificationLink = `localhost:3001/auth/verification/${token}`;
    const emailBody = `
Welcome ${savedUser.name},

Thank you for registering with the Hotel Management System.

Please verify your email address by clicking the link below:
${verificationLink}

This link will expire in 10 minutes.

If you did not request this, please ignore this email.

Best regards,  
Hotel Management Team
`;
    await sendEmail(savedUser.email, "Regarding Staff verification", emailBody);
    const newStaffDetail = await new StaffDetail({
      staffId: savedUser._id,
      address,
      city,
      state,
    });
    const saveStaffDetail = await newStaffDetail.save();
    const data = {
      _id: savedUser._id,
      email: savedUser.email,
      userType: savedUser.userType,
    };
    return successResponse(
      res,
      { success: true, message: "staff registered sucessfully", data },
      201
    );
  } catch (error) {
    console.error("Error in registerStaff:", error);
    return errorResponse(
      res,
      { success: false, message: "Something went wrong" },
      500,
      error
    );
  }
};

export const verifyStaff = async (req, res) => {
  try {
    const { token } = req.body;
    const decodeToken = await jwt.verify(token, process.env.JWT_SECRET);

    const findUser = await User.findById(decodeToken.id);
    if (!findUser) {
      return errorResponse(
        res,
        { success: false, message: "UnAuthorized or token expired " },
        401
      );
    }

    findUser.isEmailVerified = true;
    await findUser.save();

    return successResponse(
      res,
      { success: true, message: "email verified successfully" },
      200
    );
  } catch (error) {
    console.log(error);
    if (error.name == "JsonWebTokenError") {
      return errorResponse(
        res,
        { success: false, message: "Invalid toke " },
        401
      );
    }
    return errorResponse(
      res,
      { success: false, message: "Something went wrong" },
      500,
      error.message
    );
  }
};

export const connectWithStripe = async (req, res) => {
  try {
    const user = req.user._id;
    const staffdetail = req.staffDetail;
    console.log(process.env.STRIPE_SECRET_KEY);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const account = await stripe.accounts.create({
      type: "express",
      email: req.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    await StaffDetail.findByIdAndUpdate(
      staffdetail._id,
      { $set: { stripeId: account.id } },
      { new: true }
    );
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "http://localhost:3001/dashboard",
      return_url: "http://localhost:3001/dashboard",
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.log(error);
    return errorResponse(
      res,
      { success: false, message: "Something went wrong" },
      500,
      error.message
    );
  }
};

export const verifyStripe = async (req, res) => {
  try {
    const staff = await StaffDetail.findOne({ staffId: req.user._id });
    if (!staff) {
      return errorResponse(
        res,
        { success: false, message: "staff not found" },
        402
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const account = await stripe.accounts.retrieve(staff.stripeId);

    if (
      !account.charges_enabled ||
      !account.details_submitted ||
      !account.payouts_enabled
    ) {
      return errorResponse(
        res,
        {
          succcess: false,
          message:
            "Your account is not connected with stripe please connect it",
        },
        402
      );
    }
    staff.isStripeConnected = true;
    await staff.save();
    return successResponse(
      res,
      { success: true, message: "Account connected successfully" },
      200
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      res,
      { success: false, message: "Something went wrong" },
      500,
      error.message
    );
  }
};
