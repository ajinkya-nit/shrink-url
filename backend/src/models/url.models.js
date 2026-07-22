import mongoose, { Schema } from "mongoose";
    
const urlSchema = new Schema({
    shortCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    originalUrl: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(val) {
                try {
                    new URL(val)
                    return true
                } catch (error) {
                    console.log("URL is invalid!")
                    return false;
                }
            }
        }
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    isActive:{
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date
    }
}, { timestamps: true })

export const Url = mongoose.model("Url", urlSchema)