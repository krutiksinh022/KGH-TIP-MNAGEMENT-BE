import mongoose from "mongoose";
import {
  CONTRACTOR,
  DIRECT_HIRE,
  INVITED,
  REGISTERED,
} from "../constants/common.constants.js";

const staffDetail = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    employmentType: {
      type: String,
      enum: [CONTRACTOR, DIRECT_HIRE],
      required: true,
      default: CONTRACTOR,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [INVITED, REGISTERED],
      default: INVITED,
    },
    token: {
      type: String,
      required: true,
    },
    HotelId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const StaffDetails = mongoose.model("StaffDetail", staffDetail);

export default StaffDetails;
