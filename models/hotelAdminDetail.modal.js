import mongoose from "mongoose";

const hotelAdminDetailSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
},{timestamps: true});
const HotelAdminDetail = mongoose.model("HotelAdminDetail", hotelAdminDetailSchema);
export default HotelAdminDetail;