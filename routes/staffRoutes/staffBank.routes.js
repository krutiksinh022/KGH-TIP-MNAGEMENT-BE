import express from "express";
import { addStaffBankDetails } from "../../controllers/StaffManagement/staffBank.controller.js";
import { authorize } from "../../middleware/auth.middleware.js";
import { USER_TYPES } from "../../constants/common.constants.js";
const router = express.Router();
/**
 * @swagger
 * /staff/bank-detail:
 *   post:
 *     security:
 *       - bearerAuth: []   # Requires JWT token in Authorization header
 *     tags: [Staff BankDetail]
 *     summary: Add or verify staff bank details
 *     description: Allows staff to add their bank account details, which are validated with Adyen before being saved.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *
 *               - accountHolderName
 *               - countryCode
 *               - currency
 *             properties:
 *               accountHolderName:
 *                 type: string
 *                 example: John Doe
 *               iban:
 *                 type: string
 *                 example: NL91ABNA0417164300
 *               accountNumber:
 *                 type: string
 *                 example: 0417164300
 *               branchCode:
 *                 type: string
 *                 example: 1234
 *               bankName:
 *                 type: string
 *                 example: ABN AMRO
 *               countryCode:
 *                 type: string
 *                 example: NL
 *               currency:
 *                 type: string
 *                 example: EUR
 *     responses:
 *       200:
 *         description: Bank details added & verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bank details added & verified successfully
 *                 bankDetail:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f1a9d6c8f3e1b234abcd12
 *                     staffId:
 *                       type: string
 *                       example: 64d2f7d5a92f0c1234abcd12
 *                     accountHolderName:
 *                       type: string
 *                       example: John Doe
 *                     iban:
 *                       type: string
 *                       example: NL91ABNA0417164300
 *                     bankName:
 *                       type: string
 *                       example: ABN AMRO
 *                     countryCode:
 *                       type: string
 *                       example: NL
 *                     currency:
 *                       type: string
 *                       example: EUR
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid bank details provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid bank details
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Staff not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to add bank details
 */

router.post("/bank-detail", authorize(USER_TYPES.Staff), addStaffBankDetails);

export default router;
