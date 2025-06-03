import express from "express";
import { createHotel } from "../../controllers/superAdmin/hote.controller.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Super Admin Hotels
 *   description: Endpoints related to user authentication
 */

/**
 * @swagger
 * /super-admin/hotel-management:
 *   post:
 *     summary: Create a new hotel
 *     tags: [Super Admin Hotels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hotelName
 *               - address
 *             properties:
 *               hotelName:
 *                 type: string
 *                 example: "Grand Palace Hotel"
 *               address:
 *                 type: string
 *                 example: "123 Main St, New York, NY"
 *               city:
 *                 type: string
 *                 example: "New York"
 *               state:
 *                 type: string
 *                 example: "NY"
 *               country:
 *                 type: string
 *                 example: "USA"
 *               price:
 *                 type: number
 *                 example: 120.5
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
 *                   example: Hotel created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/hotel-management",createHotel)

export default router;