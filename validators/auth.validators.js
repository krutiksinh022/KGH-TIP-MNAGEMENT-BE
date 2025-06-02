import Joi from "joi";

export const loginValidator = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": `Email should be a type of text`,
    "string.email": `Email must be a valid email`,
    "string.empty": `Email cannot be empty`,
    "any.required": `Email is required`,
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": `Password should be a type of text`,
    "string.empty": `Password cannot be empty`,
    "string.min": `Password should be at least 6 characters long`,
    "any.required": `Password is required`,
  }),
});

export const forgotPasswordValidator = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": `Email should be a type of text`,
    "string.email": `Email must be a valid email`,
    "string.empty": `Email cannot be empty`,
    "any.required": `Email is required`,
  }),
});


export const verifyOtpValidator=Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": `Email should be a type of text`,
    "string.email": `Email must be a valid email`,
    "string.empty": `Email cannot be empty`,
    "any.required": `Email is required`,
  }),
  otp: Joi.string().length(6).required().messages({
    "string.base": `OTP should be a type of text`,
    "string.length": `OTP must be exactly 6 characters long`,
    "string.empty": `OTP cannot be empty`,
    "any.required": `OTP is required`,
  }),
});
export const resetPasswordValidator = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": `Email should be a type of text`,
    "string.email": `Email must be a valid email`,
    "string.empty": `Email cannot be empty`,
    "any.required": `Email is required`,
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.base": `New Password should be a type of text`,
    "string.empty": `New Password cannot be empty`,
    "string.min": `New Password should be at least 6 characters long`,
    "any.required": `New Password is required`,
  }),
});
