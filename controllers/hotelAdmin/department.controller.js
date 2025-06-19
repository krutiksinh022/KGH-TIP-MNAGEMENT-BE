import {
  errorResponse,
  successResponse,
} from "../../helpers/common.helpers.js";
import { createDepartmentValidator } from "../../validators/department.validators.js";
import Department from "../../models/department.model.js";
import StaffDetail from "../../models/staffDetail.model.js";

export const createDepartment = async (req, resp) => {
  try {
    // 1. Validate body
    const { departmentName, staff } =
      await createDepartmentValidator.validateAsync(req.body);

    const hotel = req.hotel; // Assuming middleware adds authenticated hotel data
    const hotelId = hotel._id;

    // 2. Check if department with same name already exists in the same hotel
    const existingDepartment = await Department.findOne({
     departmentName,
      hotelId,
    });

    if (existingDepartment) {
      return errorResponse(
        resp,
        {
          success: false,
          message: `Department with name '${departmentName}' already exists in this hotel.`,
        },
        400
      );
    }

    const staffDetails = await StaffDetail.find({
      staffId: { $in: staff },
      isStripeConnected: true,
    });

    const validStaffIds = staffDetails.map((s) => s.staffId.toString());
    const missingStaff = staff.filter((id) => !validStaffIds.includes(id));

    if (missingStaff.length > 0) {
      return errorResponse(
        resp,
        {
          success: false,
          message: `These staff members either don't exist or are not connected to Stripe.`,
        //   invalidStaff: missingStaff,
        },
        404
      );
    }

    const department = new Department({
      departmentName,
      hotelId,
      staffMembers: staff,
    });

    const savedDepartment = await department.save();
    await Promise.all(
      staff.map(async (staffId) => {
        await StaffDetail.updateOne(
          { staffId },
          { $addToSet: { departmentIds: savedDepartment._id } } // avoid duplicates
        );
      })
      );
      
    return successResponse(
      resp,
      {
        success: true,
        message: "Department created successfully",
        data: savedDepartment,
      },
      201
    );
  } catch (error) {
    console.error("Create Department Error:", error);
    return errorResponse(
      resp,
      { success: false, message: "Something went wrong" },
      500,
      error
    );
  }
};


export const updateDepartment = async (req, resp) => {
  try {
    const { departmentId } = req.params;
    const { departmentName, staff } =
      await createDepartmentValidator.validateAsync(req.body);
    const hotelId = req.hotel._id;

    const department = await Department.findOne({ _id: departmentId, hotelId });
    if (!department) {
      return errorResponse(
        resp,
        {
          success: false,
          message: "Department not found for this hotel",
        },
        404
      );
    }

    // Check for duplicate department name (except itself)
    const existingDepartment = await Department.findOne({
      departmentName,
      hotelId,
      _id: { $ne: departmentId },
    });

    if (existingDepartment) {
      return errorResponse(
        resp,
        {
          success: false,
          message: `Another department with the name '${departmentName}' already exists in this hotel.`,
        },
        400
      );
    }

    const staffDetails = await StaffDetail.find({
      staffId: { $in: staff },
      isStripeConnected: true,
    });

    const validStaffIds = staffDetails.map((s) => s.staffId.toString());
    const invalidStaff = staff.filter((id) => !validStaffIds.includes(id));
    if (invalidStaff.length > 0) {
      return errorResponse(
        resp,
        {
          success: false,
          message:
            "Some staff members are either not found or not connected to Stripe.",
        },
        404
      );
    }

    // Update department fields
    department.departmentName = departmentName;
    department.staffMembers = staff;
    await department.save();

    await Promise.all(
      staff.map(async (staffId) => {
        await StaffDetail.updateOne(
          { staffId },
          { $addToSet: { departmentIds: department._id } }
        );
      })
    );

    // Remove departmentId from staff who are no longer in this department
    const previousStaff = department.staffMembers.map((id) => id.toString());
    const removedStaff = previousStaff.filter((id) => !staff.includes(id));

    await Promise.all(
      removedStaff.map(async (staffId) => {
        await StaffDetail.updateOne(
          { staffId },
          { $pull: { departmentIds: department._id } }
        );
      })
    );

    return successResponse(
      resp,
      {
        success: true,
        message: "Department updated successfully",
        data: department,
      },
      200
    );
  } catch (error) {
    console.error("Update Department Error:", error);
    return errorResponse(
      resp,
      {
        success: false,
        message: "Something went wrong",
      },
      500,
      error
    );
  }
};
