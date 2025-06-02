import mongoose from "mongoose";

const forgotPasswordRequestSchema = new mongoose.Schema(
  {
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    otp: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ForgotPasswordRequest=mongoose.model("ForgotPasswordRequest", forgotPasswordRequestSchema);
export default ForgotPasswordRequest;
