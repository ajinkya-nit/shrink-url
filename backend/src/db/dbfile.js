import { DB_NAME } from "../constants.js"
import mongoose from "mongoose"

const connectDB = async () => {
    try{
        const connectionStatus = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\nMONGODB CONNECTED !!`)
        console.log(connectionStatus.connection.host)
        console.log(connectionStatus.connection.name)
    }
    catch (err){
        console.log("MONGODB connection error check dbfile.js ⚠️", err)
        process.exit(1)
    }
}

export default connectDB