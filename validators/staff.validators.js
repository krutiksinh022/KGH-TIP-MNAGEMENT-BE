import Joi from "joi";
import { CONTRACTOR, DIRECT_HIRE } from "../constants/common.constants.js";

export const inviteStaffValidator = Joi.object({
  firstName: Joi.string().trim().required().messages({
    "string.base": "First name must be a string.",
    "string.empty": "First name is required.",
  }),
  lastName: Joi.string().trim().required().messages({
    "string.base": "Last name must be a string.",
    "string.empty": "Last name is required.",
  }),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/) // E.164 format
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be in valid international format (e.g., +12015550123).",
      "string.empty": "Phone number is required.",
    }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address.",
    "string.empty": "Email is required.",
  }),
  employmentType: Joi.string()
    .valid(CONTRACTOR, DIRECT_HIRE)
    .required()
    .messages({
      "any.only": `Employment type must be one of [${CONTRACTOR}, ${DIRECT_HIRE}].`,
      "string.empty": "Employment type is required.",
    }),
  department: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId
    .required()
    .messages({
      "string.pattern.base": "Department must be a valid MongoDB ObjectId.",
      "string.empty": "Department is required.",
    }),
});
