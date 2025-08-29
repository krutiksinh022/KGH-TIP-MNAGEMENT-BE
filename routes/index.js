import express from "express";
import authRoutes from "../routes/auth/auth.routes.js";
import HotelRoutes from "../routes/SuperAdmin/HotelRoutes.js";
import departmentRoutes from "../routes/hotelRoutes/department.js";
import staffRoutes from "../routes/hotelRoutes/staff.js"
const router = express.Router();

router.use("/auth", authRoutes);

//super-admin
router.use("/super-admin", HotelRoutes);

//hotel-admin
router.use("/hotel-admin", departmentRoutes);
router.use("/hotel-admin", staffRoutes);
export default router;
