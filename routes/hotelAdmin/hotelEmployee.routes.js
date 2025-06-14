import express from "express";
import {
  getRegisterEmployee,
  MyEmployee,
  requestHistory,
  sendOnbordingRequest,
} from "../../controllers/hotelAdmin/hotelEmployee.controlller.js";
import { authorize } from "../../middleware/auth.middleware.js";
import { USER_TYPES } from "../../constants/common.constants.js";

const router = express.Router();
/**
 * @swagger
 * /hotel-admin/register-employee:
 *   get:
 *     summary: Get all employees under the hotel admin
 *     tags: [Hotel Admin Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term for filtering employees by name or email
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: integer
 *           enum: [1, -1]
 *           default: -1
 *         description: Sort order (1 for ascending, -1 for descending)
 *     responses:
 *       200:
 *         description: List of employees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60f7f9f4d72c2b001f0d9b5e"
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     example: "john.doe@example.com"
 *                   phone:
 *                     type: string
 *                     example: "+91-9876543210"
 *                   role:
 *                     type: string
 *                     example: "Receptionist"
 *                   status:
 *                     type: string
 *                     example: "active"
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */

router.get(
  "/register-employee",
  authorize([USER_TYPES.HOTEL_ADMIN]),
  getRegisterEmployee
);

/**
 * @swagger
 * /hotel-admin/send-request:
 *   post:
 *     summary: Send request to onboard a hotel staff
 *     tags: [Hotel Admin Employee Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - staffId
 *             properties:
 *               staffId:
 *                 type: string
 *                 format: objectId
 *                 example: "60c72b609b1d8e5a2f4d8f1f"
 *     responses:
 *       201:
 *         description: Hotel staff onboarding request created successfully
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
 *                   example: Hotel staff enrollment request sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60f7f9f4d72c2b001f0d9b5e"
 *                     hotelId:
 *                       type: string
 *                       example: "60c72b2f9b1d8e5a2f4d8f1e"
 *                     staffId:
 *                       type: string
 *                       example: "60c72b609b1d8e5a2f4d8f1f"
 *                     requestedBy:
 *                       type: string
 *                       example: "60c72b809b1d8e5a2f4d8f20"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-12T09:25:30.123Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-12T09:25:30.123Z"
 *       400:
 *         description: Bad Request - missing or invalid data
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

router.post(
  "/send-request",
  authorize([USER_TYPES.HOTEL_ADMIN]),
  sendOnbordingRequest
);
/**
 * @swagger
 * /hotel-admin/my-employee:
 *   get:
 *     summary: Get all employees associated with the logged-in hotel admin
 *     tags: [Hotel Admin Employee Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employees fetched successfully
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
 *                   example: Employees fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       employeeName:
 *                         type: string
 *                         example: "John Doe"
 *                       hotelId:
 *                         type: string
 *                         example: "60c72b2f9b1d8e5a2f4d8f1e"
 *                       employeeId:
 *                         type: string
 *                         example: "60f7f9f4d72c2b001f0d9b5e"
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
router.get("/my-employee", authorize([USER_TYPES.HOTEL_ADMIN]), MyEmployee);

/**
 * @swagger
 * /hotel-admin/request-history:
 *   get:
 *     summary: Get staff enrollment request history for the hotel admin
 *     tags: [Hotel Admin Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Approved, Rejected]
 *         required: false
 *         description: Filter results by status (Approved or Rejected)
 *     responses:
 *       200:
 *         description: Request history fetched successfully
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
 *                   example: Request history fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       employeeName:
 *                         type: string
 *                         example: "Jane Smith"
 *                       employeeId:
 *                         type: string
 *                         example: "60f7f9f4d72c2b001f0d9b5e"
 *                       hotelId:
 *                         type: string
 *                         example: "60c72b2f9b1d8e5a2f4d8f1e"
 *                       status:
 *                         type: string
 *                         example: "Accepted"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-13T10:12:45.000Z"
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


router.get("/request-history",authorize([USER_TYPES.HOTEL_ADMIN]),requestHistory)
export default router;
