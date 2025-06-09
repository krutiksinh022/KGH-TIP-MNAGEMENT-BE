import { errorResponse } from "../../helpers/common.helpers"

export const getStripeConnectedEmployee=(req,res)=>{
    try {
        console.log("get employee")
    } catch (error) {
        return errorResponse(res,{success:false,message:"Something went wrong"},500)
    }
}