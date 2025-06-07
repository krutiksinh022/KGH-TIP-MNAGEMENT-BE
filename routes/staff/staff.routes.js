import express from 'express';
import { registerStaff, verifyStaff } from '../../controllers/staff/staffRegistration.controller.js';
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

export default router;