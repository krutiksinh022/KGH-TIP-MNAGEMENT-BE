import mongoose from "mongoose";
import { STATES } from "../constants/common.constants.js";

const hotelSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
      enum: Object.values(STATES),
    },
    city: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    admin: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    country: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: false,
    },
    staff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Hotel = mongoose.model("Hotel", hotelSchema);
export default Hotel;
