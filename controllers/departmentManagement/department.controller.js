import {
  errorResponse,
  successResponse,
} from "../../helpers/common.helpers.js";
import Department from "../../models/department.model.js";
import { createDepartmentValidator } from "../../validators/department.validators.js";

export const createDepartMent = async (req, resp) => {
  try {
    const { departmentName } = await createDepartmentValidator.validateAsync(
      req.body
    );
    const hotelId = req.hotel?._id || req.user?.hotelId;
    const existing = await Department.findOne({
      hotelId,
      departmentName: { $regex: new RegExp(`^${departmentName}$`, "i") },
    });

    if (existing) {
      return errorResponse(
        resp,
        { message: "Department name already exists for this hotel" },
        400
      );
    }

    if (!hotelId) {
      return errorResponse(
        resp,
        { message: "Hotel not found for this admin" },
        404
      );
    }

    // create department
    const department = await Department.create({
      departmentName,
      hotelId,
    });

    return successResponse(
      resp,
      {
        message: "Department created successfully",
        departmentId: department._id,
        department,
      },
      201
    );
  } catch (error) {
    console.error("Error creating hotel:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

// ✅ Update Department
export const updateDepartment = async (req, resp) => {
  try {
    const { departmentId } = req.params;

    // validate body
    const { departmentName } = await createDepartmentValidator.validateAsync(
      req.body
    );

    // get hotelId from logged-in hotel-admin
    const hotelId = req.hotel?._id || req.user?.hotelId;
    if (!hotelId) {
      return errorResponse(
        resp,
        { message: "Hotel not found for this admin" },
        404
      );
    }

    // check if department exists & belongs to hotel
    const department = await Department.findOne({ _id: departmentId, hotelId });
    if (!department) {
      return errorResponse(resp, { message: "Department not found" }, 404);
    }

    // check uniqueness within the same hotel
    const existing = await Department.findOne({
      hotelId,
      departmentName: { $regex: new RegExp(`^${departmentName}$`, "i") },
      _id: { $ne: departmentId }, // exclude current department
    });

    if (existing) {
      return errorResponse(
        resp,
        { message: "Department name already exists for this hotel" },
        400
      );
    }

    // update department
    department.departmentName = departmentName;
    await department.save();

    return successResponse(
      resp,
      {
        message: "Department updated successfully",
        departmentId: department._id,
        department,
      },
      200
    );
  } catch (error) {
    console.error("Error updating department:", error);

    // Joi validation error
    // if (error.isJoi) {
    //   return errorResponse(resp, { message: error.details[0].message }, 400);
    // }

    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};


export const deleteDepartment = async (req, resp) => {
  try {
    const { departmentId } = req.params;

    const hotelId = req.hotel?._id || req.user?.hotelId;
    if (!hotelId) {
      return errorResponse(
        resp,
        { message: "Hotel not found for this admin" },
        404
      );
    }

    const department = await Department.findOneAndDelete({
      _id: departmentId,
      hotelId,
    });
    if (!department) {
      return errorResponse(resp, { message: "Department not found" }, 404);
    }

    return successResponse(
      resp,
      {
        message: "Department deleted successfully",
        departmentId: department._id,
      },
      200
    );
  } catch (error) {
    console.error("Error deleting department:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

export const getDepartments = async (req, resp) => {
  try {
    const hotelId = req.hotel?._id || req.user?.hotelId;
    if (!hotelId) {
      return errorResponse(resp, { message: "Hotel not found for this admin" }, 404);
    }

    // Fetch only departmentName field
    const departments = await Department.find({ hotelId }).select("departmentName");

    return successResponse(
      resp,
      {
        message: "Departments fetched successfully",
        departments, // e.g. [ { _id: "...", departmentName: "Front Desk" }, ... ]
      },
      200
    );
  } catch (error) {
    console.error("Error fetching departments:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

