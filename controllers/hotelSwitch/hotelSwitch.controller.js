import { USER_TYPES } from "../../constants/common.constants.js";
import {
  errorResponse,
  successResponse,
} from "../../helpers/common.helpers.js";
import Hotel from "../../models/hotel.model.js";
import HotelAdminDetail from "../../models/hotelAdminDetail.model.js";

/**
 * GET /api/hotels/my-hotels
 * 👉 Returns all hotels associated with the logged-in Super Admin or Hotel Admin
 */
export const getMyHotels = async (req, res) => {
  try {
    console.log("🏨 Fetching hotels for user:", req.user);
    const user = req.user;

    // ✅ Only Super Admin and Hotel Admin can have multiple hotels
    if (
      ![USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin].includes(user.userType)
    ) {
      return errorResponse(res, { message: "Access denied" }, 403);
    }

    let hotels = [];

    if (user.userType === USER_TYPES.SuperAdmin) {
      // Super Admin can access all hotels
      hotels = await Hotel.find({}, "hotelName zipcode phone _id");
    } else {
      // Hotel Admin -> find hotels linked to this user
      const adminDetail = await HotelAdminDetail.findOne({ userId: user._id });
      if (
        !adminDetail ||
        !adminDetail.hotelIds ||
        adminDetail.hotelIds.length === 0
      ) {
        return successResponse(res, { hotels: [] }, "No hotels assigned yet");
      }
      hotels = await Hotel.find(
        { _id: { $in: adminDetail.hotelIds } },
        "hotelName zipcode phone _id"
      );
    }
    console.log("🏨 Hotels fetched:", res, hotels);
    return successResponse(res, { data: hotels }, 200);
  } catch (error) {
    return errorResponse(res, { message: error.message }, 500);
  }
};

/**
 * POST /api/hotels/switch
 * 👉 Allows Super Admin or Hotel Admin to switch their current hotel
 */
export const switchHotel = async (req, res) => {
  try {
    const { hotelId } = req.body;
    const user = req.user;

    if (!hotelId)
      return errorResponse(res, { message: "Hotel ID is required" }, 400);

    if (
      ![USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin].includes(user.userType)
    ) {
      return errorResponse(res, { message: "Access denied" }, 403);
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return errorResponse(res, { message: "Hotel not found" }, 404);

    // ✅ Update user's selected hotel
    user.selectedHotelId = hotel._id;
    user.selectedHotelName = hotel.hotelName;
    await user.save();

    return successResponse(
      res,
      { selectedHotelId: hotel._id, selectedHotelName: hotel.hotelName },
      200
    );
  } catch (error) {
    return errorResponse(res, { message: error.message }, 500);
  }
};
export const getSelectedHotel = async (req, res) => {
  try {
    const user = req.user;

    if (
      ![USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin].includes(user.userType)
    ) {
      return errorResponse(res, { message: "Access denied" }, 403);
    }

    if (!user.selectedHotelId) {
      return successResponse(
        res,
        { selectedHotel: null },
        "No hotel selected yet"
      );
    }

    const hotel = await Hotel.findById(
      user.selectedHotelId,
      "hotelName zipcode phone _id"
    );
    if (!hotel) {
      return successResponse(
        res,
        { selectedHotel: null },
        "Selected hotel not found"
      );
    }

    return successResponse(res, { selectedHotel: hotel }, 200);
  } catch (error) {
    return errorResponse(res, { message: error.message }, 500);
  }
};
