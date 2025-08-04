import express from "express";
import { authorize } from "../../middleware/auth.middleware.js";
import { getStaffTip } from "../../controllers/staff/staffTip.Controller.js";
import { USER_TYPES } from "../../constants/common.constants.js";

const router = express.Router();
/**
 * @swagger
 * /staff/tips:
 *   get:
 *     summary: Get all tips received by staff
 *     tags:
 *       - Staff Tip Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tips received by the staff
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tips retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       hotelName:
 *                         type: string
 *                         example: Taj Hotel
 *                       amount:
 *                         type: number
 *                         example: 50
 *                       ratings:
 *                         type: number
 *                         example: 4.5
 *                       reviews:
 *                         type: string
 *                         example: Excellent service!
 */
router.get("/tips", authorize(USER_TYPES.Staff), getStaffTip);
export default router;
