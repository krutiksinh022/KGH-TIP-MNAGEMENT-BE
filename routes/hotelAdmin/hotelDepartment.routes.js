import express from "express";
import { createDepartment, getDepartmentDetail, getSingleDepartment, updateDepartment } from "../../controllers/hotelAdmin/department.controller.js";
import { authorize } from "../../middleware/auth.middleware.js";
import { USER_TYPES } from "../../constants/common.constants.js";

const router = express.Router();
/**
 * @swagger
 * /hotel-admin/department:
 *   post:
 *     summary: Create a new department and assign staff
 *     tags:
 *       - Hotel Admin Department Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departmentName
 *               - staff
 *             properties:
 *               departmentName:
 *                 type: string
 *                 example: Housekeeping
 *               staff:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *                   example: 60f6b9f8e13c3b35a0d2e0c2
 *     responses:
 *       201:
 *         description: Department created successfully
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
 *                   example: Department created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 664c0fef9dfb2fc81aa7c92b
 *                     name:
 *                       type: string
 *                       example: Housekeeping
 *                     hotelId:
 *                       type: string
 *                       example: 664c0d0f9dfb2fc81aa7c345
 *                     staffMembers:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: objectId
 */

router.post("/department", authorize(USER_TYPES.HOTEL_ADMIN), createDepartment);

/**
 * @swagger
 * /hotel-admin/department/{departmentId}:
 *   put:
 *     summary: Update an existing department and its assigned staff
 *     tags:
 *       - Hotel Admin Department Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: The ID of the department to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departmentName
 *               - staff
 *             properties:
 *               departmentName:
 *                 type: string
 *                 example: Housekeeping
 *               staff:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *                   example: 60f6b9f8e13c3b35a0d2e0c2
 *     responses:
 *       200:
 *         description: Department updated successfully
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
 *                   example: Department updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 664c0fef9dfb2fc81aa7c92b
 *                     departmentName:
 *                       type: string
 *                       example: Housekeeping
 *                     hotelId:
 *                       type: string
 *                       example: 664c0d0f9dfb2fc81aa7c345
 *                     staffMembers:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: objectId
 *       400:
 *         description: Validation error or duplicate department name
 *       404:
 *         description: Department not found or staff not connected to Stripe
 *       500:
 *         description: Internal server error
 */
router.put("/department/:departmentId", authorize(USER_TYPES.HOTEL_ADMIN), updateDepartment);

/**
 * @swagger
 * /hotel-admin/department:
 *   get:
 *     summary: Get all departments with employee count
 *     tags:
 *       - Hotel Admin Department Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of departments with employee count
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
 *                   example: Departments fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       departmentName:
 *                         type: string
 *                         example: Housekeeping
 *                       employeesCount:
 *                         type: integer
 *                         example: 5
 *       401:
 *         description: Unauthorized – Token is missing or invalid
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 */

router.get("/department", authorize(USER_TYPES.HOTEL_ADMIN), getDepartmentDetail);

/**
 * @swagger
 * /hotel-admin/department/{departmentId}:
 *   get:
 *     summary: Get details of a specific department by ID
 *     tags:
 *       - Hotel Admin Department Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: The ID of the department to retrieve
 *     responses:
 *       200:
 *         description: Department details fetched successfully
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
 *                   example: Department details fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     departmentName:
 *                       type: string
 *                       example: Housekeeping
 *                     employeesCount:
 *                       type: integer
 *                       example: 4
 *                     staffMembers:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: objectId
 *                         example: 60f6b9f8e13c3b35a0d2e0c2
 *       401:
 *         description: Unauthorized – Token is missing or invalid
 *       404:
 *         description: Department not found or does not belong to hotel
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 */
router.get("/department/:departmentId",authorize(USER_TYPES.HOTEL_ADMIN),getSingleDepartment);
export default router;
