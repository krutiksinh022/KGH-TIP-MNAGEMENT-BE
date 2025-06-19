import express from "express";
import { createDepartment } from "../../controllers/hotelAdmin/department.controller.js";
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
export default router;
