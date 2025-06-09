import express from "express";
import authRoutes from "./auth.routes.js"
import hotelRoutes from "./superAdmin/hotel.routes.js"
import staffRouter from "./staff/staff.routes.js"
import hotelRoutes from "./hotelAdmin/hotelEmployee.routes.js"
const router = express.Router();

router.use("/auth",authRoutes)


//super-admin routes

router.use("/super-admin",hotelRoutes)

//staff routes
router.use("/staff",staffRouter)

//hotel admin
router.use("/hotel-admin",hotelRoutes)
export default router;