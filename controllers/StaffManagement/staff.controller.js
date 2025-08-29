import { USER_TYPES } from "../../constants/common.constants.js";
import { errorResponse, generateDefaultPassword, generateJwtToken, successResponse } from "../../helpers/common.helpers.js";
import StaffDetails from "../../models/staffDetail.model.js";
import User from "../../models/user.model.js";
import { inviteStaffValidator } from "../../validators/staff.validators.js";

export const inviteStaff = async (req, resp) => {
  try {
    const result = await inviteStaffValidator.validateAsync(req.body);
      const { firstName, lastName, phoneNumber, email, employementType, department } = result;
      const invitedBy = req.user._id;
      const hotelId = req.user._id;
      const password = generateDefaultPassword()
      
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return errorResponse(
          resp,
          { message: "User with this email already exists" },
          401
        );
      }

      const newUser = new User({
        name: `${firstName}`,
        email,
        password,
        userType: USER_TYPES.Staff
      });
      await newUser.save();
      const token = generateJwtToken(newUser);
      const newStaff = new StaffDetails({
        userId: newUser._id,
        invitedBy,
        phoneNumber,
        email,
        employementType,
        department,
        firstName,
        lastName,
        HotelId: [hotelId], // array
        token: token,
      });
      await newStaff.save();
      return successResponse(resp, {
        message: "Staff invited successfully",
        staffId: newStaff._id,
        userId: newUser._id,
      },);
  } catch (error) {
      console.log(error)
    return errorResponse(resp,{ message: "Server error" }, 500, error);
  }
};
