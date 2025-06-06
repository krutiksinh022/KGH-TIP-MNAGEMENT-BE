import express from "express";
import { createHotel, deleteHotel, getHotel, getSingleHotelId, updateHotel } from "../../controllers/superAdmin/hotel.controller.js";
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
router.post("/hotel-management", authorize([USER_TYPES.SUPER_ADMIN]), createHotel)

/**
 * @swagger
 * /super-admin/hotel-management/{hotelId}:
 *   put:
 *     summary: Update an existing hotel's details and assigned admin(s)
 *     tags: [Super Admin Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the hotel to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hotelName:
 *                 type: string
 *                 example: "Updated Grand Palace Hotel"
 *               address:
 *                 type: string
 *                 example: "456 New Address St, New York, NY"
 *               state:
 *                 type: string
 *                 example: "New York"
 *               city:
 *                 type: string
 *                 example: "Brooklyn"
 *               country:
 *                 type: string
 *                 example: "USA"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1987654321"
 *               admin:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                   example: newadmin@example.com
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: "https://www.updatedgrandpalace.com"
 *     responses:
 *       200:
 *         description: Hotel updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid hotel ID or missing data
 *       404:
 *         description: Hotel not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel not found
 *       500:
 *         description: Internal server error
 */

router.put("/hotel-management/:hotelId", authorize([USER_TYPES.SUPER_ADMIN]), updateHotel)
/**
 * @swagger
 * /super-admin/hotel-management:
 *   get:
 *     summary: Get paginated list of hotels (name, city, and state only)
 *     tags: [Super Admin Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of hotels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotels fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       hotelName:
 *                         type: string
 *                         example: "Grand Palace Hotel"
 *                       city:
 *                         type: string
 *                         example: "Manhattan"
 *                       state:
 *                         type: string
 *                         example: "New York"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch hotel list
 */
router.get("/hotel-management", authorize([USER_TYPES.SUPER_ADMIN]), getHotel)

/**
 * @swagger
 * /super-admin/hotel-management/{hotelId}:
 *   delete:
 *     summary: Delete a hotel by ID
 *     tags: [Super Admin Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the hotel to delete
 *     responses:
 *       200:
 *         description: Hotel deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel deleted successfully
 *       404:
 *         description: Hotel not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to delete hotel
 */

router.delete("/hotel-management/:hotelId",authorize([USER_TYPES.SUPER_ADMIN]),deleteHotel)

/**
 * @swagger
 * /super-admin/hotel-management/{hotelId}:
 *   get:
 *     summary: Get details of a specific hotel by ID
 *     tags: [Super Admin Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the hotel to retrieve
 *     responses:
 *       200:
 *         description: Hotel retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       400:
 *         description: Invalid hotel ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid hotel ID
 *       404:
 *         description: Hotel not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel not found
 *       500:
 *         description: Internal server error
 */
router.get("/hotel-management/:hotelId", authorize([USER_TYPES.SUPER_ADMIN]),getSingleHotelId)
export default router;