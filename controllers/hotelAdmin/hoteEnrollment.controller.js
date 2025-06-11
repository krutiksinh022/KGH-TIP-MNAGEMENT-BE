import { errorResponse } from "../../helpers/common.helpers.js"

export const sendEnrollmentRwquest=(req,resp)=>{
    try {
        
    } catch (error) {
        return errorResponse(resp,{succes:"false",message:"Something went wrong"},500)
    }
}