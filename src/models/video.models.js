import mongoose from "mongoose";   
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; 

const videoSchema = new mongoose.Schema({
    videoFile:{
        type: String,  //cloudinary url
        required: [true, 'Video file is required']
    },
    thumbnail: {
        type: String,  //cloudinary url
        required: [true, 'Thumbnail is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        
    },
    
    duration: {
        type: Number,  // duration in seconds   
        required: [true, 'Duration is required']
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished:{
        type: Boolean,
        default: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true  // Reference to the User model
    },
    // likes: {
    //     type: Number,
    //     default: 0
    // },
    // comments: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Comment"
    // }]
}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);

