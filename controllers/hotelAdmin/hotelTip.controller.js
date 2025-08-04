import {
  errorResponse,
  successResponse,
} from "../../helpers/common.helpers.js";
import { paginationHelper } from "../../helpers/pagination.helper.js";
import RatingReviews from "../../models/ratingsReview.model.js";

export const HotelEmployeeTip = async (req, res) => {
  try {
    const user = req.user;
    const hotelDetail = req.hotel;
    const { limit, page, searchTerm, skip } = paginationHelper(req.query);

    // Base match query
    const matchQuery = { hotelId: hotelDetail._id };

    const tipAggregation = [
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "users",
          localField: "staffId",
          foreignField: "_id",
          as: "staffDetail",
        },
      },
      {
        $unwind: {
          path: "$staffDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Apply search filter if searchTerm exists
      ...(searchTerm
        ? [
            {
              $match: {
                "staffDetail.name": { $regex: searchTerm, $options: "i" },
              },
            },
          ]
        : []),
      {
        $project: {
          _id: 1,
          hotelId: 1,
          amount: 1,
          reviews: 1,
          ratings: 1,
          staffName: "$staffDetail.name",
        },
      },
    ];

    // Clone pipeline for total count
    const countPipeline = [...tipAggregation, { $count: "total" }];
    const countResult = await RatingReviews.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Add pagination stages
    tipAggregation.push({ $skip: skip }, { $limit: limit });

    const tipDetail = await RatingReviews.aggregate(tipAggregation);

    return successResponse(
      res,
      {
        success: true,
        message: "Tips fetched successfully",
        data: tipDetail,
        pagination: {
          currentPage: page,
          limit,
          totalData: total,
          totalPages: Math.ceil(total / limit),
        },
      },
      200
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      res,
      {
        success: false,
        message: "Something went wrong",
      },
      500,
      error
    );
  }
};

