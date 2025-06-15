import Stripe from "stripe";
import { errorResponse, successResponse } from "../../helpers/common.helpers.js";
import StaffDetail from "../../models/staffDetail.model.js";
import { sendTipValidator } from "../../validators/tip.validators.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const sendTip = async (req, resp) => {
  try {
    const { staffId, amount } = await sendTipValidator.validateAsync(req.body);
    const findStaff = await StaffDetail.findOne({ staffId: staffId });
    console.log(findStaff);
      if (!findStaff) {
        return errorResponse(resp,{success:false,message:"Staff not found"},402)
    }
      if (!findStaff.staffId || !findStaff.isStripeConnected) {
        return errorResponse(resp,{success:false,message:"Employee verification Pending"},402)
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      description: `Tip for staff`,
      payment_method_types: ["card"], 
      transfer_data: {
        destination: findStaff.stripeId,
      },
    });
    return successResponse(resp,{success:true,message:"Stripe connected successfully",data:paymentIntent.client_secret},200)
  } catch (error) {
    return errorResponse(
      resp,
      {
        success: false,
        message: "Something went wrong",
      },
      error
    );
  }
};
