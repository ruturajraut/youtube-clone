import { isValidObjectId } from "mongoose"; 
import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true,
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null, // Allow likes to be associated with videos only
    },
    tweet:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet",
        default: null, // Allow likes to be associated with tweets only
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
},{ timestamps: true });



export const Like = mongoose.model("Like", likeSchema);