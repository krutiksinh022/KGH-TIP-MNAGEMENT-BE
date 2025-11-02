import mongoose from "mongoose";
import {
  CONTRACTOR,
  DIRECT_HIRE,
  INVITED,
  REGISTERED,
} from "../constants/common.constants.js";

const staffDetailSchema = new mongoose.Schema(
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
      default: CONTRACTOR,
      required: true,
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
    hotelIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
      },
    ],
    position: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // 🧠 Added fields for Tip System
    qrCode: {
      type: String, // base64 or image URL
    },
    tipLink: {
      type: String, // public tip URL (e.g. https://yourdomain.com/tip/:staffId)
    },
    totalTips: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ✅ Middleware / static method to check if staff can login
staffDetailSchema.statics.canStaffLogin = async function (userId) {
  const staff = await this.findOne({ userId }).populate("hotelIds");

  if (!staff) return false;

  // staff itself inactive
  if (!staff.isActive) return false;

  // all hotels inactive
  const hasActiveHotel = staff.hotelIds.some(
    (hotel) => hotel?.isActive === true
  );

  return hasActiveHotel;
};

const StaffDetail = mongoose.model("StaffDetail", staffDetailSchema);
export default StaffDetail;
