import mongoose from "mongoose";
import {
  errorResponse,
  successResponse,
} from "../../helpers/common.helpers.js";
import Hotel from "../../models/hotel.model.js";

export const getMyHotelDetail = async (req, resp) => {
  try {
    const user = req.user;
    console.log(user);
    const hotelDetail = req.hotel;
    console.log(hotelDetail);
    const findMyHotel = await Hotel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(hotelDetail._id),
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "admin",
          as: "admin",
        },
      },
      {
        $project: {
          _id: 1,
          hotelName: 1,
          Address: 1,
          phoneNumber: 1,
          state: 1,
          city: 1,
          country: 1,
          website: 1,
          admin: "$admin.email",
        },
      },
    ]);
    return successResponse(
      resp,
      {
        success: true,
        message: "Hotel detail fetched succesffully ",
        data: findMyHotel[0],
      },
      200
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      resp,
      { success: false, message: "something went wrong" },
      500,
      error
    );
  }
};
