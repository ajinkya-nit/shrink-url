import ApiError from "../utils/ApiError"
import ApiResponse from "../utils/ApiResponse"

const generateAccessAndRefreshTokens = async function (userId) {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save( { validateBeforeSave: false} )
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500, "error in generating access and refresh token.")
    }
}

const registerUser = asyncHandler(async(req, res, next) => {
    const { fullName , email, password } = req.body
    if(
        [fullName, email, password ].some(check => check?.trim === "")
    ) throw new ApiError(400, "all fields are required.")

    const existedUser = await User.findOne({
        email
    })

    if(existedUser) throw new ApiError(409, "email already exists.")

    const user = await User.create({
        fullName,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser) throw new ApiError(500, "something went wrong while creating new user.")
    
    res.status(201).json( new ApiResponse(201, "user created successfully."))
})

