import { errorResponse } from "../../helpers/common.helpers.js";

export const getMyHotelDetail = (req, resp) => {
  try {
    const user = req.user;
    console.log(user);
  } catch (error) {
    return errorResponse(
      resp,
      { success: false, message: "something went wrong" },
      500,
      error
    );
  }
};
