import express from "express";
import {
  createHotel,
  deleteHotel,
  getHotel,
  getHotelById,
  updateHotel,
} from "../../controllers/hotelManagement/hotelManagemnt.controller.js";
import { authorizeBasic } from "../../middleware/auth.middleware.js";
import { USER_TYPES } from "../../constants/common.constants.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Hotel Management
 *   description: Endpoints for managing hotels and their admins
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /super-admin/hotel-management:
 *   post:
 *     security:
 *       - bearerAuth: []    # Requires JWT token in Authorization header
 *     tags: [Hotel Management]
 *     summary: Create a new hotel and assign an admin
 *     description: Creates a hotel and automatically assigns an admin user with a system-generated password. Requires super-admin authorization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hotelName
 *               - address1
 *               - city
 *               - state
 *               - zipcode
 *               - country
 *               - phone
 *               - adminEmail
 *             properties:
 *               hotelName:
 *                 type: string
 *                 example: Hampton Inn & Suites Mesquite
 *               website:
 *                 type: string
 *                 example: https://hampton.com
 *               address1:
 *                 type: string
 *                 example: 1030 W Pioneer Blvd
 *               address2:
 *                 type: string
 *                 example: Suite 200
 *               city:
 *                 type: string
 *                 example: Mesquite
 *               state:
 *                 type: string
 *                 example: NV
 *               zipcode:
 *                 type: string
 *                 example: 89027-8808
 *               country:
 *                 type: string
 *                 example: United States
 *               phone:
 *                 type: string
 *                 example: +1 702-346-2200
 *               adminEmail:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *     responses:
 *       201:
 *         description: Hotel and Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel and Admin created successfully
 *                 hotelId:
 *                   type: string
 *                   example: 64b1e3b0a2e45f5a8c123456
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 *       401:
 *         description: UnauthorizeBasicd - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnauthorizeBasicd
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */

router.post(
  "/hotel-management",
  authorizeBasic([USER_TYPES.SuperAdmin]),
  createHotel
);
/**
 * @swagger
 * /super-admin/hotel-management/{hotelId}:
 *   put:
 *     security:
 *       - bearerAuth: []    # Requires JWT token in Authorization header
 *     tags: [Hotel Management]
 *     summary: Update an existing hotel
 *     description: Updates all details of a hotel by its ID. Requires super-admin authorization.
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
 *                 example: Updated Hotel Name
 *               website:
 *                 type: string
 *                 example: https://updated-hotel.com
 *               address1:
 *                 type: string
 *                 example: 456 Updated Blvd
 *               address2:
 *                 type: string
 *                 example: Suite 300
 *               city:
 *                 type: string
 *                 example: Los Angeles
 *               state:
 *                 type: string
 *                 example: CA
 *               zipcode:
 *                 type: string
 *                 example: 90001
 *               country:
 *                 type: string
 *                 example: United States
 *               phone:
 *                 type: string
 *                 example: +1 310-123-4567
 *     responses:
 *       200:
 *         description: Hotel details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel details updated successfully
 *                 hotel:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64b1e3b0a2e45f5a8c123456
 *                     hotelName:
 *                       type: string
 *                       example: Updated Hotel Name
 *                     website:
 *                       type: string
 *                       example: https://updated-hotel.com
 *                     city:
 *                       type: string
 *                       example: Los Angeles
 *                     state:
 *                       type: string
 *                       example: CA
 *       400:
 *         description: Bad Request - Missing hotelId or required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel ID is required
 *       401:
 *         description: UnauthorizeBasicd - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnauthorizeBasicd
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
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
router.put(
  "/hotel-management/:hotelId",
  authorizeBasic([USER_TYPES.SuperAdmin]),
  updateHotel
);

/**
 * @swagger
 * /super-admin/hotel-management/{hotelId}:
 *   delete:
 *     security:
 *       - bearerAuth: []    # Requires JWT token in Authorization header
 *     tags: [Hotel Management]
 *     summary: Delete a hotel
 *     description: Deletes a hotel by its ID. Requires super-admin authorization. Optionally removes linked admin users.
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
 *                 deletedHotelId:
 *                   type: string
 *                   example: 64b1e3b0a2e45f5a8c123456
 *       400:
 *         description: Bad Request - Missing hotelId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel ID is required
 *       401:
 *         description: UnauthorizeBasicd - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnauthorizeBasicd
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
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
router.delete(
  "/hotel-management/:hotelId",
  authorizeBasic([USER_TYPES.SuperAdmin]),
  deleteHotel
);

/**
 * @swagger
 * /super-admin/hotel-management:
 *   get:
 *     security:
 *       - bearerAuth: []    # Requires JWT token in Authorization header
 *     tags: [Hotel Management]
 *     summary: Get list of hotels
 *     description: Retrieves a paginated list of hotels with optional search by hotel name, city, or state.
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
 *         description: Number of hotels per page
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *           example: Delhi
 *         description: Search term to filter by hotel name, city, or state
 *     responses:
 *       200:
 *         description: List of hotels fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64b1e3b0a2e45f5a8c123456
 *                       hotelName:
 *                         type: string
 *                         example: Taj Palace
 *                       city:
 *                         type: string
 *                         example: New Delhi
 *                       state:
 *                         type: string
 *                         example: Delhi
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: UnauthorizeBasicd - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnauthorizeBasicd
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */

router.get(
  "/hotel-management",
  authorizeBasic([USER_TYPES.SuperAdmin]),
  getHotel
);

/**
 * @swagger
 * /super-admin/hotel-management/{hotelId}:
 *   get:
 *     security:
 *       - bearerAuth: []    # Requires JWT token in Authorization header
 *     tags: [Hotel Management]
 *     summary: Get detailed hotel information by ID
 *     description: Retrieves full details of a hotel along with its linked admin users.
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64b1e3b0a2e45f5a8c123456
 *         description: The ID of the hotel to retrieve
 *     responses:
 *       200:
 *         description: Hotel details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel details fetched successfully
 *                 hotel:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64b1e3b0a2e45f5a8c123456
 *                     hotelName:
 *                       type: string
 *                       example: Taj Palace
 *                     website:
 *                       type: string
 *                       example: https://tajhotels.com
 *                     address1:
 *                       type: string
 *                       example: 123 Main St
 *                     address2:
 *                       type: string
 *                       example: Suite 101
 *                     city:
 *                       type: string
 *                       example: New Delhi
 *                     state:
 *                       type: string
 *                       example: Delhi
 *                     zipcode:
 *                       type: string
 *                       example: 110001
 *                     country:
 *                       type: string
 *                       example: India
 *                     phone:
 *                       type: string
 *                       example: +91 9812345678
 *                     createdAt:
 *                       type: string
 *                       example: 2025-08-14T05:32:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       example: 2025-08-14T05:32:00.000Z
 *                     admins:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64b1e3b0a2e45f5a8c654321
 *                           email:
 *                             type: string
 *                             example: admin@taj.com
 *                           userType:
 *                             type: string
 *                             example: HOTEL_ADMIN
 *                           createdAt:
 *                             type: string
 *                             example: 2025-08-14T05:35:00.000Z
 *       400:
 *         description: Bad Request - Missing hotelId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel ID is required
 *       401:
 *         description: UnauthorizeBasicd - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnauthorizeBasicd
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
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
router.get(
  "/hotel-management/:hotelId",
  authorizeBasic([USER_TYPES.SuperAdmin]),
  getHotelById
);
export default router;
