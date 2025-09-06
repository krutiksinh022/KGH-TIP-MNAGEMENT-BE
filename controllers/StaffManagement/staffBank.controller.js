import { errorResponse } from "../../helpers/common.helpers.js"
import { staffBankDetailValidator } from "../../validators/staff.validators.js"
import axios  from "axios"
export const addStaffBankDetails =async (req,resp)=>{
    try {
        const result = await staffBankDetailValidator.validateAsync(req.body);

        const staffId = req.staffDetail._id;
        const userId = req.user._id;
        const {
          accountHolderName,
          iban,
          accountNumber,
          branchCode,
          bankName,
          countryCode,
          currency,
        } = result;

       
    } catch (error) {
        console.log(error)
        return errorResponse(resp, { message: "server error" }, 500, error);
    }
}