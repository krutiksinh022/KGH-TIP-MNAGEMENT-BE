import Joi from "joi";

export const createDepartmentValidator = Joi.object({
  departmentName: Joi.string().trim().required().messages({
    "string.base": "Department name must be a string.",
    "string.empty": "Department name is required.",
    "any.required": "Department name is required.",
  }),
});
