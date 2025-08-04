import {
  errorResponse,
  successResponse,
} from "../../helpers/common.helpers.js";
import StaffDetail from "../../models/staffDetail.model.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getAccountMoney = async (req, resp) => {
  try {
    const userId = req.user._id;
    const findStaff = await StaffDetail.findOne({ staffId: userId });

    if (!findStaff) {
      return errorResponse(resp, { message: "user not found" }, 400);
    }
    const ballance = await stripe.balance.retrieve({
      stripeAccount: findStaff.stripeId,
    });
    console.log(ballance.pending[0]);
    //   return successResponse(resp,{message:"})

    // const transaction = await stripe.balanceTransactions.list({
    //   limit: 10,
    //   stripeAccount: findStaff.stripeId,
    // });

    return successResponse(resp, {
      success: true,
      messsage: "balance retrive sucessfully",
        data: {
          available:data
      },
    });
  } catch (error) {
    return errorResponse(
      resp,
      { success: false, message: "Something went wrong" },
      500,
      error.message
    );
  }
};
