import Joi from "joi";

export const createDepartmentValidator = Joi.object({
  departmentName: Joi.string().trim().required().messages({
    "string.base": "Department name must be a string.",
    "string.empty": "Department name is required.",
    "any.required": "Department name is required.",
  }),

  staff: Joi.array().items(Joi.string().required()).required().messages({
    "array.base": "Staff must be an array of user IDs.",
    "any.required": "Staff field is required.",
  }),
});
