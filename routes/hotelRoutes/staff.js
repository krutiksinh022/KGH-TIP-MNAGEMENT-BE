import express from "express";
import { authorize } from "../../middleware/auth.middleware.js";
import { USER_TYPES } from "../../constants/common.constants.js";
import {
  getAllStaff,
  getStaffById,
  inviteStaff,
  revokeStaffInvite,
  updateStaff,
} from "../../controllers/StaffManagement/staff.controller.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Staff Invitation
 *   description: Endpoints for inviting staff to the hotel wallet system
 */

/**
 * @swagger
 * /hotel-admin/invite-staff:
 *   post:
 *     security:
 *       - bearerAuth: []   # Requires JWT token in Authorization header
 *     tags: [Staff Invitation]
 *     summary: Invite a staff member
 *     description: Allows a hotel-admin to invite a staff member. The system automatically assigns `invitedBy`, `userId`, `HotelId`, `status`, and `token`. Only the fields listed in the request body need to be provided.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - email
 *               - employmentType
 *               - department
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Staff first name
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: Staff last name
 *                 example: Doe
 *               phoneNumber:
 *                 type: string
 *                 description: Staff phone number
 *                 example: "+1 201-555-0123"
 *               email:
 *                 type: string
 *                 description: Staff email address
 *                 example: staff@example.com
 *               employmentType:
 *                 type: string
 *                 enum: [CONTRACTOR, DIRECT_HIRE]
 *                 description: Type of employment
 *                 example: CONTRACTOR
 *               department:
 *                 type: string
 *                 description: Department ID (MongoDB ObjectId)
 *                 example: 64c2f1b1d9a45e6f7b789012
 *     responses:
 *       201:
 *         description: Staff invited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invitation sent successfully
 *                 staffId:
 *                   type: string
 *                   example: 64c2f1b1d9a45e6f7b987654
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad Request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields
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
  "/invite-staff",
  authorize([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  inviteStaff
);
router.get(
  "/invite-staff",
  authorize([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  getAllStaff
);
router.get(
  "/invite-staff/:staffId",
  authorize([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  getStaffById
);
router.post(
  "/invite-staff/:staffId",
  authorize([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  revokeStaffInvite
);
router.put(
  "/invite-staff/:id",
  authorize([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  updateStaff
);

export default router;
