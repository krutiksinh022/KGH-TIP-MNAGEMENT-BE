import express from "express";
import authRoutes from "../routes/auth/auth.routes.js";
import HotelRoutes from "../routes/SuperAdmin/HotelRoutes.js";
import hotelSwitchRoutes from "../routes/hotelSwitchRoutes/hotelSwitch.routes.js";
import departmentRoutes from "../routes/hotelRoutes/department.js";
import staffRoutes from "../routes/hotelRoutes/staff.js";
import staffManagement from "../routes/staffRoutes/staffRoutes.js";
import staffBankRoutes from "../routes/staffRoutes/staffBank.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);

//super-admin
router.use("/v1", HotelRoutes);
router.use("/v1", hotelSwitchRoutes);

//hotel-admin
router.use("/v2", departmentRoutes);
router.use("/v2", staffRoutes);

//staff-detail
router.use("/staff", staffManagement);
router.use("/staff", staffBankRoutes);
export default router;
