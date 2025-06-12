import mongoose from "mongoose";
import { HOTEL_STAFF_ENROLLMENT } from "../constants/common.constants.js";

const hotelStaffEnrollmentSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StaffDetail",
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(HOTEL_STAFF_ENROLLMENT),
    default: "pending",
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
},{timestamps:true});

const HotelStaffEnrollment = mongoose.model("HotelStaffEnrollment", hotelStaffEnrollmentSchema);
export default HotelStaffEnrollment;
