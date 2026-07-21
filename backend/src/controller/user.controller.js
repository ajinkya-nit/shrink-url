import { User } from "../models/users.models"
import ApiError from "../utils/ApiError"
import ApiResponse from "../utils/ApiResponse"
import asyncHandler from "../utils/asyncHandler"

const generateAccessAndRefreshTokens = async function (userId) {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500, "error in generating access and refresh token.")
    }
}

const registerUser = asyncHandler(async (req, res, next) => {
    const { fullName, email, password } = req.body
    if (
        [fullName, email, password].some(check => check?.trim === "")
    ) throw new ApiError(400, "all fields are required.")

    const existedUser = await User.findOne({
        email
    })

    if (existedUser) throw new ApiError(409, "email already exists.")

    const user = await User.create({
        fullName,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) throw new ApiError(500, "something went wrong while creating new user.")

    res.status(201).json(new ApiResponse(201, "user created successfully."))
})

const loginUser = asyncHandler(async (req, res) => {
    const [email, password] = req.body
    if (!email) throw new ApiError(400, "email is required.")
    if (!password) throw new ApiError(400, "password is required.")

    const user = User.findOne({ email })
    if (!user) throw new ApiError(404, "user doesn't exists.")

    const isPassValid = user.isPasswordCorrect(password)
    if (!isPassValid) throw new ApiError(401, "password is incorrect.")

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            }, "user logged in successfully")
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Token expired")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", newrefreshToken)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newrefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Error while generating refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res)=> {
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }
    
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

