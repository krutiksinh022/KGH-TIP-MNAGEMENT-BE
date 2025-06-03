import express from "express";
import authRoutes from "./auth.routes.js"
import hotelRoutes from "./superAdmin/hotel.routes.js"
const router = express.Router();

router.use("/auth",authRoutes)


//super-admin routes

router.use("/super-admin",hotelRoutes)
export default router;