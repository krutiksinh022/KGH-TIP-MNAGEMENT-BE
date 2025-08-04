import express from "express";
import authRoutes from "../routes/auth/auth.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);

export default router;
