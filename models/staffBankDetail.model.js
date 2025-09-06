import mongoose from "mongoose";

const staffBankDetailSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffDetail",
      required: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffDetail",
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    iban: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    branchCode: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: String,
      required: true,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    adyenBankAccountId: {
      type: String, 
      default: null,
    },
  },
  { timestamps: true }
);

const StaffBankDetail = mongoose.model(
  "StaffBankDetail",
  staffBankDetailSchema
);

export default StaffBankDetail;
