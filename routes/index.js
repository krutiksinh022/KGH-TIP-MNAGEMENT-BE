import express from "express";
import authRoutes from "./auth.routes.js"
import hotelRoutes from "./superAdmin/hotel.routes.js"
import staffRouter from "./staff/staff.routes.js"
const router = express.Router();

router.use("/auth",authRoutes)


//super-admin routes

router.use("/super-admin",hotelRoutes)

//staff routes
router.use("/staff",staffRouter)
export default router;