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

export const staffBankDetailValidator = Joi.object({
  accountHolderName: Joi.string().required().messages({
    "string.base": "Account holder name must be a string.",
    "string.empty": "Account holder name is required.",
    "any.required": "Account holder name is required.",
  }),
  iban: Joi.string()
    .pattern(/^[A-Z0-9]+$/)
    .allow("")
    .messages({
      "string.pattern.base": "IBAN must contain only alphanumeric characters.",
    }),
  accountNumber: Joi.string().allow("").messages({
    "string.base": "Account number must be a string.",
  }),
  branchCode: Joi.string().allow("").messages({
    "string.base": "Branch code must be a string.",
  }),
  bankName: Joi.string().allow("").messages({
    "string.base": "Bank name must be a string.",
  }),
  countryCode: Joi.string().length(2).required().messages({
    "string.base": "Country code must be a string.",
    "string.length": "Country code must be exactly 2 letters (ISO).",
    "any.required": "Country code is required.",
  }),
  currency: Joi.string().length(3).required().messages({
    "string.base": "Currency must be a string.",
    "string.length":
      "Currency must be a valid 3-letter ISO code (e.g., EUR, USD).",
    "any.required": "Currency is required.",
  }),
});
