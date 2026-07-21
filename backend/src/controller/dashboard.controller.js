import { Url } from "../models/url.models.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"


const analytics = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortType = "desc"
    } = req.query

    const userId = req.user._id
    const skip = (Number(page) - 1) * Number(limit)

    const result = await Url.aggregate([
        {
            $match: {
                userId: userId
            }
        },
        {
            $facet: {
                statistics: [
                    {
                        $group: {
                            _id: null,
                            totalUrls: {
                                $sum: 1
                            },
                            totalClicks: {
                                $sum: "$clicks"
                            },
                            totalActiveUrls: {
                                $sum: {
                                    $cond: ["$isActive", 1, 0]
                                }
                            },
                            totalExpiredUrls: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $ne: ["$expiresAt", null] },
                                                { $lt: ["$expiresAt", new Date()] }
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ],
                recentUrls: [
                    {
                        $sort: {
                            createdAt: sortType == "asc" ? 1 : -1
                        }
                    },
                    {
                        $skip: skip
                    },
                    {
                        $limit: Number(limit)
                    }
                ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, result, "analytics fetched."))
})

const activeUrls = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortType = "desc"
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    const result = await Url.aggregate([
        {
            $match: {
                userId: req.user._id,
                isActive: true,
                $or: [
                    { expiresAt: null },
                    { expiresAt: { $gt: new Date() } }
                ]
            }
        },
        {
            $sort: {
                createdAt: sortType == "asc" ? 1 : -1
            }
        },
        {
            $skip: skip
        },
        {
            $limit: Number(limit)
        }
    ])

    return res.status(200).json(new ApiResponse(200, result, "active urls fetched."))
})

const deactiveUrls = asyncHandler(async(req,res) => {
    const {
        page = 1,
        limit = 10,
        sortType = "desc"
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    const result = await Url.aggregate([
        {
            $match: {
                userId: req.user._id,
                isActive: false,
                $or: [
                    { expiresAt: null },
                    { expiresAt: { $gt: new Date() } }
                ]
            }
        },
        {
            $sort: {
                createdAt: sortType == "asc" ? 1 : -1
            }
        },
        {
            $skip: skip
        },
        {
            $limit: Number(limit)
        }
    ])

    return res.status(200).json(new ApiResponse(200, result, "deactive urls fetched."))
})