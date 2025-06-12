import express from 'express';
import { responseStaffRequest, StaffOnboardingRequest } from '../../controllers/staff/staffOnbording.controller.js';
import { authorize } from '../../middleware/auth.middleware.js';
import { USER_TYPES } from '../../constants/common.constants.js';
const router = express.Router();
/**
 * @swagger
 * /staff/get-request:
 *   get:
 *     summary: Get all pending enrollment requests for the logged-in staff
 *     tags: [Staff Enrollment Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60f7f9f4d72c2b001f0d9b5e"
 *                       hotelId:
 *                         type: string
 *                         example: "60c72b2f9b1d8e5a2f4d8f1e"
 *                       staffId:
 *                         type: string
 *                         example: "60c72b609b1d8e5a2f4d8f1f"
 *                       requestedBy:
 *                         type: string
 *                         example: "60c72b809b1d8e5a2f4d8f20"
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-06-12T09:25:30.123Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-06-12T09:25:30.123Z"
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized access
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 */


router.get("/get-request",authorize([USER_TYPES.Staff]),StaffOnboardingRequest)
/**
 * @swagger
 * /staff/approve-request/{requestId}:
 *   put:
 *     summary: Approve or reject an enrollment request by the staff
 *     tags: [Staff Enrollment Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: MongoDB ObjectId of the enrollment request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response
 *             properties:
 *               response:
 *                 type: string
 *                 enum: [Approve, Rejected]
 *                 example: "Approve"
 *     responses:
 *       200:
 *         description: Request status updated successfully
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
 *                   example: Enrollment request approved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60f7f9f4d72c2b001f0d9b5e"
 *                     status:
 *                       type: string
 *                       example: "approved"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-12T10:35:00.000Z"
 *       400:
 *         description: Invalid status or request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request data
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized access
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Enrollment request not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 */
router.put("/approve-request/:requestId",authorize([USER_TYPES.Staff]),responseStaffRequest);
export default router;