import express from "express";
import {
  createReviews,
  sendTip,
} from "../../controllers/TipController/tip.controller.js";

const router = express.Router();

/**
 * @swagger
 * /tip-management/send-tip:
 *   post:
 *     summary: Send a tip amount to the specified staff
 *     tags:
 *       - Tip Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - staffId
 *               - amount
 *             properties:
 *               staffId:
 *                 type: string
 *                 example: "684afd8ea2b7170f00740481"
 *                 description: The MongoDB ID of the staff receiving the tip
 *               amount:
 *                 type: number
 *                 example: 10
 *                 description: The tip amount in USD
 *     responses:
 *       200:
 *         description: Tip PaymentIntent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                   example: "pi_1RZxyz...secret_xyz"
 *                 message:
 *                   type: string
 *                   example: Tip intent created
 *       400:
 *         description: Invalid input or staff not connected to Stripe
 *       500:
 *         description: Server error while processing tip
 */

router.post("/send-tip", sendTip);

/**
 * @swagger
 * /tip-management/review-rating:
 *   post:
 *     summary: Submit a tip with optional review and rating for a staff member
 *     tags:
 *       - Tip Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hotelId
 *               - staffId
 *               - amount
 *             properties:
 *               hotelId:
 *                 type: string
 *                 description: MongoDB ObjectId of the hotel
 *                 example: "60f6c2a4c25e4d001f8f7a92"
 *               staffId:
 *                 type: string
 *                 description: MongoDB ObjectId of the staff
 *                 example: "684afd8ea2b7170f00740481"
 *               amount:
 *                 type: number
 *                 description: Tip amount in USD
 *                 example: 20
 *               reviews:
 *                 type: string
 *                 description: Optional review from the user
 *                 example: "Excellent service and very friendly."
 *               ratings:
 *                 type: number
 *                 description: Rating between 1 and 5
 *                 example: 5
 *     responses:
 *       200:
 *         description: Review and rating submitted successfully
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
 *                   example: Review submitted successfully
 *                 data:
 *                   $ref: '#/components/schemas/RatingReview'
 *       400:
 *         description: Bad request or missing required fields
 *       500:
 *         description: Internal server error
 */

router.post("/review-rating", createReviews);

export default router;
