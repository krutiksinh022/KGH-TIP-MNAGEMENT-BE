import {
  errorResponse,
  successResponse,
} from "../../helpers/common.helpers.js";
import { paginationHelper } from "../../helpers/pagination.helper.js";
import StaffDetail from "../../models/staffDetail.model.js";

export const getStripeConnectedEmployee = (req, res) => {
  try {
    
  } catch (error) {
    return errorResponse(
      res,
      { success: false, message: "Something went wrong" },
      500
    );
  }
};

export const getRegisterEmployee = async (req, resp) => {
  try {
    const {
      skip,
      limit,
      searchTerm,
      sortField,
      sortOrder
    } = paginationHelper(req.query);

    // const matchStage = {
    //   isStripeConnected: true
    // };

    const searchMatch = searchTerm
      ? {
          $or: [
            { "staffDetail.name": { $regex: searchTerm, $options: "i" } },
            { city: { $regex: searchTerm, $options: "i" } },
            { state: { $regex: searchTerm, $options: "i" } },
          ]
        }
      : {};

    const Staff = await StaffDetail.aggregate([
    //   {
    //     $match: matchStage
    //   },
      {
        $lookup: {
          from: "users",
          localField: "staffId",
          foreignField: "_id",
          as: "staffDetail"
        }
      },
      {
        $unwind: {
          path: "$staffDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: searchMatch
      },
      {
        $project: {
          _id: 1,
          staffId: 1,
          city: 1,
          state: 1,
          isStripeConnected: 1,
          staffName: "$staffDetail.name",
          createdAt: "$staffDetail.createdAt"
        }
      },
      {
        $sort: {
          [sortField]: sortOrder
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    return successResponse(
      resp,
      { success: true, message: "Staff fetched successfully", data: Staff },
      200
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      resp,
      { success: false, message: "Something went wrong" },
      500
    );
  }
};

