import mongoose from "mongoose";

const HotelAdminDetailSchema= new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const HotelAdminDetail = mongoose.model(
  "HotelAdminDetail",
  HotelAdminDetailSchema
);

export default HotelAdminDetail;
