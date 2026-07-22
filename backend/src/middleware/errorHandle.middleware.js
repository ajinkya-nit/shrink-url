import ApiError from "../utils/ApiError.js"

export const errorHandle = function (err, req, res, next) {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "something went wrong"
    })
}