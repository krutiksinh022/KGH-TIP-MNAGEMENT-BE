import express from "express";
import authRoutes from "./auth.routes.js"
import hotelRoutes from "./superAdmin/hotel.routes.js"
import staffRouter from "./staff/staff.routes.js"
import hotelAdminRoutes from "./hotelAdmin/hotelEmployee.routes.js"
import staffOnBoardingRoutes from "./staff/staffOnboard.routes.js"
import tipRoutes from "./TipRoute/tip.routes.js"
import staffTipRoutes from "./staff/staffTip.routes.js"
import hotelTipRoutes from "./hotelAdmin/hotel.tip.routes.js"
import hotelDepartmentRoutes from "./hotelAdmin/hotelDepartment.routes.js"
import HotelAdminDetailRoutes from "./hotelAdmin/hotel.detail.routes.js";
const router = express.Router();

router.use("/auth",authRoutes)


//super-admin routes

router.use("/super-admin",hotelRoutes)

//staff routes
router.use("/staff", staffRouter)
router.use("/staff", staffOnBoardingRoutes)
router.use("/staff",staffTipRoutes)

//hotel admin
router.use("/hotel-admin", hotelAdminRoutes)
router.use("/hotel-admin",hotelTipRoutes)
router.use("/hotel-admin",hotelDepartmentRoutes)
router.use("/hotel-admin",HotelAdminDetailRoutes);
//tip routes
router.use("/tip-management",tipRoutes);
export default router;