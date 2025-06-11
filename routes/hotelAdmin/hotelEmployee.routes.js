import express from 'express';
import { getRegisterEmployee } from '../../controllers/hotelAdmin/hotelEmployee.controlller.js';
import { authorize } from '../../middleware/auth.middleware.js';
import { USER_TYPES } from '../../constants/common.constants.js';

const router =express.Router();
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


router.get("/register-employee",authorize([USER_TYPES.HOTEL_ADMIN]),getRegisterEmployee)
// router.get("/get-employee",)
export default router