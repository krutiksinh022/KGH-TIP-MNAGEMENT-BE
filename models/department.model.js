import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    staffMembers: [
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

const Department = mongoose.model("department", departmentSchema);
export default Department;