import { USER_TYPES } from "../constants/common.constants.js";
import { errorResponse, generateJwtToken, successResponse } from "../helpers/common.helpers.js";
import { sendEmail } from "../helpers/nodemail.helper.js";
import ForgotPasswordRequest from "../models/forgotPasswordRequest.model.js";
import ForgotPassword from "../models/forgotPasswordRequest.model.js";
import User from "../models/user.model.js";
import { forgotPasswordValidator, loginValidator, resetPasswordValidator, verifyOtpValidator } from "../validators/auth.validators.js";

export const login =async(req,resp)=>{
   try {
       const result=await loginValidator.validateAsync(req.body);
         const { email, password } = result;
         console.log(email,password)
      const user = await User.findOne({ email });
      console.log(user)
         if(!user){
            return errorResponse(resp,{success:false,message:"User not found"},404);
         }
         if(user.userType==USER_TYPES.Staff && !user.isEmailVerified){
                         return errorResponse(
                             resp,
                             { message: 'Email verification is pending please verify it' },
                             401,
                         );
                     }
         const isMatch=await user.isValidPassword(password);
            if(!isMatch){
                return errorResponse(resp,{success:false,message:"Invalid credentials"},401);
            }
        const token =generateJwtToken(user,"1h")
        user.jwtToken=token;
        await user.save();
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            type: user.type
        };
        return resp.status(200).json({success:true,message:"Login successful",token,data:userData});
   } catch (error) {
      console.log("Error in login controller:", error);
      errorResponse(resp,{success:false,message:"Internal Server Error"},500,error);
   }
}

export const logOut=async(req,resp)=>{
   try {
      console.log("Logout request received");
      const userId = req.userId;
      if (!userId) {
         return errorResponse(resp,{success:false,message:"Unauthorized"},401);
      }
      const user = await User.findById(userId);
      if (!user) {
         return errorResponse(resp,{success:false,message:"User not found"},404);
      }
      user.jwtToken = null; // Clear the JWT token
      await user.save();
      return resp.status(200).json({success:true,message:"Logout successful"});
   } catch (error) {
     errorResponse(resp,{success:false,message:"Internal Server Error"},500,error);
   }
}

export const forgotPassword=async(req,resp)=>{
   try {
      const result=await forgotPasswordValidator.validateAsync(req.body);
      const {email} = result;
      const user = await User.findOne({ email });
      if (!user) {
         return errorResponse(resp,{success:false,message:"User not found"},404);
      }

      const otp= Math.floor(100000 + Math.random() * 900000).toString();
      const alreadyRequested=await ForgotPasswordRequest.findOne({ userId: user._id});
      if(alreadyRequested){
         alreadyRequested.otp = otp;
         await alreadyRequested.save();
      }else{
         const forgotPasswordRequest = new ForgotPasswordRequest({
            userId: user._id,
            otp: otp,
            email: user.email
         });
         await forgotPasswordRequest.save();
      }
      await sendEmail(
         user.email,
         "Password Reset OTP",
         `Your OTP for password reset is: ${otp}`
      );
      return successResponse(resp, { success: true, message: "OTP sent to your email" }, 200);

   } catch (error) {
      console.log("Error in forgotPassword controller:", error);
      return errorResponse(resp, { success: false, message: "Internal Server Error" }, 500, error);
   }
}

export const verifyOtp=async(req,resp)=>{
   try {
      const result = await verifyOtpValidator.validateAsync(req.body);
      const { email, otp } = result;
      const user =await User.findOne({ email });
      if (!user) {
         return errorResponse(resp, { success: false, message: "User not found" }, 404);
      }
      const forgotPasswordRequest = await ForgotPassword.findOne({ userId: user._id });
      if (!forgotPasswordRequest) {
         return errorResponse(resp, { success: false, message: "No password reset request found" }, 404);
      }
      if (forgotPasswordRequest.otp !== otp) {
         return errorResponse(resp, { success: false, message: "Invalid OTP" }, 400);
      }
      forgotPasswordRequest.isVerified = true;
      await forgotPasswordRequest.save();

      return successResponse(resp, { success: true, message: "OTP verified successfully" }, 200);
   } catch (error) {
      
      console.log("Error in verifyOtp controller:", error);
      return errorResponse(resp, { success: false, message: "Internal Server Error" }, 500, error.message);
   }
}

export const resetPassword=async(req,rep)=>{
   try {
      const result=await resetPasswordValidator.validateAsync(req.body);
      const { email, newPassword } = result;
      const user=await User.findOne({email});
      if (!user) {
         return errorResponse(rep, { success: false, message: "User not found" }, 404);
      }
      const forgotPasswordRequest = await ForgotPasswordRequest.findOne({ userId: user._id, isVerified: true });
      if (!forgotPasswordRequest) {
         return errorResponse(rep, { success: false, message: "No verified password reset request found" }, 404);
      }
      user.password = newPassword; // Assuming the User model has a method to hash the password
      await user.save();

      forgotPasswordRequest.isVerified = false; // Reset the request status
      await forgotPasswordRequest.save();
      return successResponse(rep, { success: true, message: "Password reset successfully" }, 200);
   } catch (error) {
      console.log("Error in resetPassword controller:", error);
      return errorResponse(rep, { success: false, message: "Internal Server Error" }, 500, error.message);
   }
}