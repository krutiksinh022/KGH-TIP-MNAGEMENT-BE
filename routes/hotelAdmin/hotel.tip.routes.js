import express from "express";
import { authorize } from "../../middleware/auth.middleware.js";
import { USER_TYPES } from "../../constants/common.constants.js";
import { HotelEmployeeTip } from "../../controllers/hotelAdmin/hotelTip.controller.js";

const router = express.Router();

/**
 * @swagger
 * /hotel-admin/tips:
 *   get:
 *     summary: Get all tips given by hotel admin to staff
 *     tags:
 *       - Hotel Admin Tip Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of records per page
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *           example: John
 *         description: Search by staff name or review
 *     responses:
 *       200:
 *         description: List of tips with staff details
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
 *                       staffName:
 *                         type: string
 *                         example: John Doe
 *                       amount:
 *                         type: number
 *                         example: 100
 *                       review:
 *                         type: string
 *                         example: Great work and professionalism!
 *                       rating:
 *                         type: number
 *                         example: 4.8
 */

router.get("/tips",authorize(USER_TYPES.HOTEL_ADMIN),HotelEmployeeTip)

export default router;
