import mongoose from "mongoose";
import { STATES } from "../constants/common.constants.js";

const staffDetailSchema = new mongoose.Schema({
    staffId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    address:{
        type: String,
        required: true,
    },
    city:{
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
        enum:Object.values(STATES)
    },
    stripeId: {
        type: String,
    },
    isStripeConnected:{
        type:Boolean,
        require:false,
        default:false
    }
})

const StaffDetail = mongoose.model("StaffDetail", staffDetailSchema);
export default StaffDetail;