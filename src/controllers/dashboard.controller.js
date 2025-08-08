import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get all videos by user
    const videos = await Video.find({ owner: userId });

    const totalVideos = videos.length;
    const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);

    // Get total likes on user's videos
    const videoIds = videos.map((video) => video._id);
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

    // Get total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            totalViews,
            totalLikes,
            totalSubscribers
        }, "Channel stats fetched successfully")
    );
});


const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const videos = await Video.find({ owner: userId })
        .sort({ createdAt: -1 }); // most recent first

    res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    );
});


export {
    getChannelStats, 
    getChannelVideos
    }