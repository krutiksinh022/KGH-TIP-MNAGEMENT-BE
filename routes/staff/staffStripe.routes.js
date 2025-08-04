import express from "express";
import { getAccountMoney } from "../../controllers/staff/staffStripe.controller.js";
import { authorize } from "../../middleware/auth.middleware.js";
import { USER_TYPES } from "../../constants/common.constants.js";
const router = express.Router();
/**
 * @swagger
 * /staff/stripe/get-amount:
 *   get:
 *     summary: Get Stripe account available balance
 *     tags: [Staff Stripe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the current available and pending Stripe balance for the staff
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 balance:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: number
 *                       example: 150.25
 *                     pending:
 *                       type: number
 *                       example: 50.00
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (user not a staff)
 */

router.get(
  "/stripe/get-amount",
  authorize([USER_TYPES.Staff]),
  getAccountMoney
);
export default router;
