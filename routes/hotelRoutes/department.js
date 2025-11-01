import express from "express";
import { authorize } from "../../middleware/auth.middleware.js";
import { USER_TYPES } from "../../constants/common.constants.js";
import {
  createDepartMent,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "../../controllers/departmentManagement/department.controller.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Department Management
 *   description: Endpoints for managing hotel departments
 */

/**
 * @swagger
 * /hotel-admin/department:
 *   post:
 *     security:
 *       - bearerAuth: []   # Requires JWT token in Authorization header
 *     tags: [Department Management]
 *     summary: Create a new department
 *     description: Allows a hotel-admin to create a department under their assigned hotel. The hotel is automatically determined from the logged-in admin’s account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departmentName
 *             properties:
 *               departmentName:
 *                 type: string
 *                 example: Housekeeping
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Department created successfully
 *                 departmentId:
 *                   type: string
 *                   example: 64c2f1b1d9a45e6f7b123456
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
  "/department",
  authorize([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  createDepartMent
);

/**
 * @swagger
 * /hotel-admin/department/{departmentId}:
 *   put:
 *     security:
 *       - bearerAuth: []   # Requires JWT token in Authorization header
 *     tags: [Department Management]
 *     summary: Update an existing department
 *     description: Allows a hotel-admin to update the department name under their assigned hotel.
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the department to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departmentName
 *             properties:
 *               departmentName:
 *                 type: string
 *                 example: Front Desk
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Department updated successfully
 *                 departmentId:
 *                   type: string
 *                   example: 64c2f1b1d9a45e6f7b123456
 *       400:
 *         description: Bad Request - Missing or invalid fields
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
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Department not found
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
router.put(
  "/department/:id",
  authorize([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  updateDepartment
);

/**
 * @swagger
 * /hotel-admin/department/{departmentId}:
 *   delete:
 *     security:
 *       - bearerAuth: []   # Requires JWT token in Authorization header
 *     tags: [Department Management]
 *     summary: Delete a department
 *     description: Allows a hotel-admin to delete a department under their assigned hotel.
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the department to delete
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Department deleted successfully
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
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Department not found
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
router.delete(
  "/department/:id",
  authorize([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  deleteDepartment
);

/**
 * @swagger
 * /hotel-admin/department:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Department Management]
 *     summary: Get all departments
 *     description: Allows a hotel-admin to fetch all department names under their assigned hotel.
 *     responses:
 *       200:
 *         description: List of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Departments fetched successfully
 *                 departments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64c2f1b1d9a45e6f7b123456
 *                       departmentName:
 *                         type: string
 *                         example: Housekeeping
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /hotel-admin/department:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Department Management]
 *     summary: Get all departments
 *     description: Allows a hotel-admin to fetch all department names under their assigned hotel.
 *     responses:
 *       200:
 *         description: List of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Departments fetched successfully
 *                 departments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64c2f1b1d9a45e6f7b123456
 *                       departmentName:
 *                         type: string
 *                         example: Housekeeping
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Server error
 */
router.get(
  "/department",
  authorize([USER_TYPES.SuperAdmin, USER_TYPES.HotelAdmin]),
  getDepartments
);

export default router;
