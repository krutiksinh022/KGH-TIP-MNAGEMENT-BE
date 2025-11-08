import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { USER_TYPES } from "../constants/common.constants.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    userType: { type: String, enum: Object.values(USER_TYPES) },
    jwtToken: { type: String, default: null },
    isPasswordChange: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    refreshToken: { type: String, default: null },

    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      default: null,
    },
    isActive: { type: Boolean, default: true },
    selectedHotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      default: null,
    },
    selectedHotelName: { type: String, default: null },

    // ✅ Add these
    profilePhoto: { type: String, default: null },
    phone: { type: String, trim: true, default: null },
    designation: { type: String, trim: true, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
