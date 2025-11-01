import Department from "../../models/department.model.js";
import Hotel from "../../models/hotel.model.js";
import { USER_TYPES } from "../../constants/common.constants.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/common.helpers.js";

// 🟢 Create Department
export const createDepartMent = async (req, resp) => {
  console.log("🏨 Create Department request received", req.body, req.headers);
  try {
    const user = req.user;
    const hotelId =
      req.headers["hotelid"] || req.body.hotelId || req.query.hotelId;
    const { departmentName } = req.body;
    console.log("🏨 Creating department for hotelId:", hotelId, departmentName);
    if (!departmentName || !hotelId) {
      return errorResponse(
        resp,
        { message: "departmentName and hotelId are required" },
        400
      );
    }

    if (
      ![USER_TYPES.HotelAdmin, USER_TYPES.SuperAdmin].includes(user.userType)
    ) {
      return errorResponse(resp, { message: "Unauthorized" }, 403);
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return errorResponse(resp, { message: "Hotel not found" }, 404);

    const existing = await Department.findOne({
      hotelId,
      departmentName: { $regex: new RegExp(`^${departmentName}$`, "i") },
    });
    if (existing)
      return errorResponse(resp, { message: "Department already exists" }, 400);

    const department = await Department.create({ departmentName, hotelId });

    return successResponse(resp, {
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

// 🟡 Update Department
export const updateDepartment = async (req, resp) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { departmentName } = req.body;
    const hotelId =
      req.headers["hotelid"] || req.body.hotelId || req.query.hotelId;
    console.log("🏨 Updating department:", id, departmentName, hotelId);
    if (!departmentName)
      return errorResponse(
        resp,
        { message: "departmentName is required" },
        400
      );

    const department = await Department.findById(id);
    if (!department)
      return errorResponse(resp, { message: "Department not found" }, 404);

    // 🔐 Restrict hotel admin
    if (
      user.userType === USER_TYPES.HotelAdmin &&
      department.hotelId.toString() !== hotelId
    ) {
      return errorResponse(
        resp,
        { message: "Unauthorized to edit this department" },
        403
      );
    }

    department.departmentName = departmentName;
    await department.save();

    return successResponse(resp, {
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

// 🟢 Get All Departments
export const getDepartments = async (req, resp) => {
  try {
    console.log("🏨 Fetching departments", req.headers);
    const user = req.user;
    const hotelId =
      req.headers["hotelid"] || req.body.hotelId || req.query.hotelId;

    if (!hotelId)
      return errorResponse(resp, { message: "hotelId is required" }, 400);

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return errorResponse(resp, { message: "Hotel not found" }, 404);

    let departments = await Department.find({ hotelId });
    console.log("🏨 Departments fetched:", departments);
    // 🔐 Masking logic for Super Admin without access
    if (
      user.userType === USER_TYPES.SuperAdmin &&
      !hotel.allowSuperAdminAccess
    ) {
      departments = departments.map((d) => ({
        ...d.toObject(),
        departmentName: "P***",
      }));
    }

    return successResponse(resp, {
      message: "Departments fetched successfully",
      hotelAccess: hotel.allowSuperAdminAccess,
      departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

// 🟣 Get Department by ID
export const getDepartmentById = async (req, resp) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const hotelId =
      req.headers["hotelid"] || req.body.hotelId || req.query.hotelId;

    const department = await Department.findById(id).populate(
      "hotelId",
      "hotelName allowSuperAdminAccess"
    );
    if (!department)
      return errorResponse(resp, { message: "Department not found" }, 404);

    // 🔐 Restrict Hotel Admin
    if (
      user.userType === USER_TYPES.HotelAdmin &&
      department.hotelId._id.toString() !== hotelId
    ) {
      return errorResponse(resp, { message: "Unauthorized access" }, 403);
    }

    // 🔐 Mask for Super Admin without access
    if (
      user.userType === USER_TYPES.SuperAdmin &&
      !department.hotelId.allowSuperAdminAccess
    ) {
      department.departmentName = "P***";
    }

    return successResponse(resp, { message: "Department fetched", department });
  } catch (error) {
    console.error("Error getting department:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};

// 🔴 Delete Department
export const deleteDepartment = async (req, resp) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const hotelId =
      req.headers["hotelid"] || req.body.hotelId || req.query.hotelId;

    const department = await Department.findById(id);
    if (!department)
      return errorResponse(resp, { message: "Department not found" }, 404);

    // Restrict hotel admin
    if (
      user.userType === USER_TYPES.HotelAdmin &&
      department.hotelId.toString() !== hotelId
    ) {
      return errorResponse(
        resp,
        { message: "Unauthorized to delete this department" },
        403
      );
    }

    await Department.findByIdAndDelete(id);
    return successResponse(resp, {
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    return errorResponse(resp, { message: "Server error" }, 500, error);
  }
};
