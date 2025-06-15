import Joi from "joi";

export const sendTipValidator = Joi.object({
  staffId: Joi.string().length(24).hex().required().messages({
    "any.required": "Staff ID is required",
    "string.length": "Staff ID must be a valid 24-character MongoDB ObjectId",
    "string.hex": "Staff ID must be a valid hex string",
  }),

  amount: Joi.number().positive().precision(2).required().messages({
    "any.required": "Amount is required",
    "number.positive": "Amount must be a positive number",
    "number.base": "Amount must be a number",
  }),
});
