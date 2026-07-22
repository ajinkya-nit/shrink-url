import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { StatusCodes } from "http-status-codes";
import { Url } from "../models/url.models.js";
import { nanoid } from "nanoid"
import ApiResponse from "../utils/ApiResponse.js";

const shortenUrl = asyncHandler(async (req, res) => {
    const { originalUrl, isActive = true, expiry = "1y" } = req.body
    const time = {
        "1d": 1,
        "1m": 28,
        "6m": 168,
        "1y": 365
    };
    const datenum = time[expiry];

    try {
        new URL(originalUrl)
    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "invalid url.")
    }

    if (expiry && !(expiry in time)) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Invalid expiry option."
        )
    }

    const expiresAt = new Date(Date.now() + datenum * 24 * 60 * 60 * 1000)
    const shortCode = nanoid()

    const url = await Url.create({
        shortCode,
        originalUrl,
        clicks: 0,
        isActive,
        userId: req.user._id,
        expiresAt
    })

    return res.status(201).json(
        new ApiResponse(201, url, "url created successfully.")
    )
})

const redirectUrl = asyncHandler(async (req, res) => {
    const { shortCode } = req.params

    const url = await Url.findOne({ shortCode })

    if (!url || ((url.expiresAt < new Date()) || !(url.isActive))) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "url is expired.")
    }

    await Url.updateOne(
        { _id: url._id },
        {
            $inc: { clicks: 1 }
        }
    )
    
    res.redirect(url.originalUrl)
})