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
  hotelId: Joi.string().length(24).hex().required().messages({
    "any.required": "Hotel ID is required",
    "string.length": "Hotel ID must be a valid 24-character ObjectId",
    "string.hex": "Hotel ID must be a valid hex string",
  }),
  reviews: Joi.string().allow("").optional(),

  ratings: Joi.number().min(1).max(5).optional().messages({
    "number.max": "Ratings cannot be greater than 5",
    "number.min": "Ratings must be at least 1",
  }),
});


export const reviewRatingValidator = Joi.object({
  hotelId: Joi.string().length(24).hex().required().messages({
    "any.required": "Hotel ID is required",
    "string.length": "Hotel ID must be a valid 24-character ObjectId",
    "string.hex": "Hotel ID must be a valid hex string",
  }),

  staffId: Joi.string().length(24).hex().required().messages({
    "any.required": "Staff ID is required",
    "string.length": "Staff ID must be a valid 24-character ObjectId",
    "string.hex": "Staff ID must be a valid hex string",
  }),

  amount: Joi.number().positive().required().messages({
    "any.required": "Amount is required",
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be a positive number",
  }),

  reviews: Joi.string().allow("").optional(),

  ratings: Joi.number().min(1).max(5).optional().messages({
    "number.max": "Ratings cannot be greater than 5",
    "number.min": "Ratings must be at least 1",
  }),
});
