import express from "express";
import { createHotel } from "../../controllers/superAdmin/hotel.controller.js";
import { authorize } from "../../middleware/auth.middleware.js";
import { USER_TYPES } from "../../constants/common.constants.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Super Admin Hotels
 *   description: Endpoints related to hotel management for Super Admin
 */

/**
 * @swagger
 * /super-admin/hotel-management:
 *   post:
 *     summary: Create a new hotel and assign admin(s)
 *     tags: [Super Admin Hotels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hotelName
 *               - address
 *               - state
 *               - city
 *               - country
 *               - phoneNumber
 *               - admin
 *             properties:
 *               hotelName:
 *                 type: string
 *                 example: "Grand Palace Hotel"
 *               address:
 *                 type: string
 *                 example: "123 Main St, New York, NY"
 *               state:
 *                 type: string
 *                 example: "New York"
 *               city:
 *                 type: string
 *                 example: "Manhattan"
 *               country:
 *                 type: string
 *                 example: "USA"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               admin:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                   example: admin@example.com
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: "https://www.grandpalace.com"
 *     responses:
 *       201:
 *         description: Hotel created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel created and admins registered successfully
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin emails are required
 *       500:
 *         description: Internal server error
 */
router.post("/hotel-management",authorize([USER_TYPES.SUPER_ADMIN]),createHotel)

export default router;