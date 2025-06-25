import express from "express";
import { authorize } from "../../middleware/auth.middleware.js";
import { USER_TYPES } from "../../constants/common.constants.js";
import { getMyHotelDetail } from "../../controllers/hotelAdmin/hotelDetail.controller.js";
const router = express.Router();
/**
 * @swagger
 * /hotel/details:
 *   get:
 *     tags: [Hotel Admin, HotelDetail]
 *     summary: Get hotel details
 *     description: Returns detailed hotel information for the authenticated user. Requires Bearer token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hotel details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6857d447d46ea83198377a32
 *                 hotelName:
 *                   type: string
 *                   example: Patel motel
 *                 address:
 *                   type: string
 *                   example: 12 victoria street
 *                 state:
 *                   type: string
 *                   example: Texas
 *                 city:
 *                   type: string
 *                   example: Huston
 *                 country:
 *                   type: string
 *                   example: United States
 *                 website:
 *                   type: string
 *                   example: https://www.Patelmotel.com/
 *                 phoneNumber:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["+1-123-456-7890"]
 *                 admin:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["adminId1", "adminId2"]
 *                 staff:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["staffId1"]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-06-22T10:00:39.320Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-06-22T10:11:23.861Z
 *                 __v:
 *                   type: integer
 *                   example: 0
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Internal server error
 */

router.get("/my-hotel", authorize(USER_TYPES.HOTEL_ADMIN), getMyHotelDetail);

export default router;
