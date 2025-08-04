import Joi from "joi";

export const registerStaffValidator = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Name must be a string.",
    "any.required": "Name is required.",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.base": "Email must be a string.",
      "string.email": "Email must be a valid email address.",
      "any.required": "Email is required.",
    }),

  mobileNumber: Joi.string()
    .pattern(/^\d{9,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must be between 9 and 15 digits.",
      "any.required": "Mobile number is required.",
    }),

  password: Joi.string().min(8).required().messages({
    "string.base": "Password must be a string.",
    "string.min": "Password must be at least 8 characters long.",
    "any.required": "Password is required.",
  }),

  address: Joi.string().required().messages({
    "string.base": "Address must be a string.",
    "any.required": "Address is required.",
  }),

  city: Joi.string().required().messages({
    "string.base": "City must be a string.",
    "any.required": "City is required.",
  }),

  state: Joi.string().required().messages({
    "string.base": "State must be a string.",
    "any.required": "State is required.",
  }),
});

export const requestResponseValidator = Joi.object({
  response: Joi.string().valid("Approved", "Rejected").required().messages({
    "string.base": "Response must be a string.",
    "any.only": 'Response must be either "Approved" or "Rejected".',
    "any.required": "Response is required.",
  }),
});
