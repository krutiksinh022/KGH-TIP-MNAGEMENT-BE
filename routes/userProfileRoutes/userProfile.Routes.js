import express from "express";
import { authorizeBasic } from "../../middleware/auth.middleware.js";
import { USER_TYPES } from "../../constants/common.constants.js";
import {
  getProfile,
  updateProfile,
} from "../../controllers/userController/user.controller.js";
import upload from "../../middleware/upload.middleware.js";
const router = express.Router();
router.put(
  "/update-profile",
  authorizeBasic([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  upload.single("profilePhoto"),
  updateProfile
);
router.get(
  "/profile",
  authorizeBasic([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  getProfile
);
export default router;
