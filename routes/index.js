import express from "express";
import authRoutes from "../routes/auth/auth.routes.js";
import HotelRoutes from "../routes/SuperAdmin/HotelRoutes.js";
const router = express.Router();

router.use("/auth", authRoutes);

//super-admin
router.use("/super-admin", HotelRoutes);
export default router;
