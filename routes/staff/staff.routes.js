import express from 'express';
import { connectWithStripe, registerStaff, verifyStaff, verifyStripe } from '../../controllers/staff/staffRegistration.controller.js';
import { authorize } from '../../middleware/auth.middleware.js';
import { USER_TYPES } from '../../constants/common.constants.js';
//import { registerStaff } from '../../controllers/staff/staffRegistration.controller.js';

const router = express.Router();

/**
 * @swagger
 * /staff/register:
 *   post:
 *     summary: Register a new staff member
 *     tags: [Staff Authentication]
 *     description: Registers a new staff member with email, mobile number, password, address, and state.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - mobileNumber
 *               - password
 *               - address
 *               - state
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: staff@example.com
 *               mobileNumber:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Staff@1234
 *               address:
 *                 type: string
 *                 example: "456 Elm Street, Downtown"
 *               city:
 *                 type: string
 *                 example: "New York"
 *               state:
 *                 type: string
 *                 example: "New York"
 *     responses:
 *       201:
 *         description: Staff registered successfully
 *       400:
 *         description: Bad request – Missing or invalid fields
 *       500:
 *         description: Internal server error
 */

router.post("/register",registerStaff)

/**
 * @swagger
 * /staff/verify-email:
 *   post:
 *     summary: Verify staff email
 *     tags: [Staff Authentication]
 *     description: Verifies the email of a staff member using a token sent via email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token received in email
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
router.post("/verify-email",verifyStaff)

/**
 * @swagger
 * /staff/stripe-connect:
 *   post:
 *     summary: Connect staff to Stripe Express account
 *     description: Generates a Stripe onboarding link for the staff to complete account setup.
 *     tags:
 *       - Staff Stripe
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stripe onboarding URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: https://connect.stripe.com/setup/s/abc123
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Server error while creating Stripe account
 */
router.post("/stripe-connect",authorize([USER_TYPES.Staff]),connectWithStripe)

/**
 * @swagger
 * /staff/stripe-verify:
 *   get:
 *     summary: Check if Stripe account is verified
 *     tags: [Staff Stripe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns whether Stripe account is verified or not
 */
router.get("/stripe-verify",authorize(USER_TYPES.Staff),verifyStripe)
export default router;