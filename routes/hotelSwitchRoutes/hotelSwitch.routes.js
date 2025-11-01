import express from "express";

import { USER_TYPES } from "../../constants/common.constants.js";
import {
  getMyHotels,
  getSelectedHotel,
  switchHotel,
} from "../../controllers/hotelSwitch/hotelSwitch.controller.js";
import { authorizeBasic } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/my-hotels",
  authorizeBasic([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  getMyHotels
);

router.post(
  "/switch",
  authorizeBasic([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  switchHotel
);
router.get(
  "/selected",
  authorizeBasic([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  getSelectedHotel
);
export default router;
