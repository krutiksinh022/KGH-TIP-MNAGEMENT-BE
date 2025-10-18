import Joi from "joi";

export const createHotelValidator = Joi.object({
  hotelName: Joi.string().required().messages({
    "string.base": "Hotel name must be a string.",
    "string.empty": "Hotel name is required.",
  }),
  address: Joi.string().required().messages({
    "string.base": "Address must be a string.",
    "string.empty": "Address is required.",
  }),
  state: Joi.string().required().messages({
    "string.base": "State must be a string.",
    "string.empty": "State is required.",
  }),
  city: Joi.string().required().messages({
    "string.base": "City must be a string.",
    "string.empty": "City is required.",
  }),
  phoneNumber: Joi.string().required().messages({
    "string.base": "Phone number must be a string.",
    "string.empty": "Phone number cannot be empty.",
    "any.required": "Phone number is required.",
  }),
  admin: Joi.array()
    .items(
      Joi.string().email().required().messages({
        "string.email": "Each admin must be a valid email.",
      })
    )
    .required()
    .messages({
      "array.base": "Admin must be an array of emails.",
      "any.required": "Admin list is required.",
    }),
  country: Joi.string().required().messages({
    "string.base": "Country must be a string.",
    "string.empty": "Country is required.",
  }),
  website: Joi.string().uri().optional().messages({
    "string.uri": "Website must be a valid URL.",
  }),
});
