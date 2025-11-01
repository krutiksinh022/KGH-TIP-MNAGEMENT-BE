import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    hotelName: { type: String, required: true, trim: true, unique: true },
    website: { type: String, trim: true },
    address1: { type: String, required: true, trim: true },
    address2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipcode: { type: String, required: true, trim: true, unique: true },
    country: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, unique: true },

    // ✅ Multiple Admins
    adminIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    allowSuperAdminAccess: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
hotelSchema.index({ hotelName: 1 }, { unique: true });
hotelSchema.index({ phone: 1 }, { unique: true });
hotelSchema.index({ zipcode: 1 }, { unique: true });
const Hotel = mongoose.model("Hotel", hotelSchema);
export default Hotel;
