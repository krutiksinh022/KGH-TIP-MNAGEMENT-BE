import express from "express"
import { createReviews, sendTip } from "../../controllers/TipController/tip.controller.js"


const router = express.Router()

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

router.post("/send-tip", sendTip)

router.post("/review-rating",createReviews);

export default router