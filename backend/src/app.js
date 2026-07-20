import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { errorHandler, next } from "./middleware/errorHandle.middleware"

const app = express()

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
} 

app.use(cors(corsOptions))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser());
app.use(errorHandle)

//routes import


//routes declaration

export default app