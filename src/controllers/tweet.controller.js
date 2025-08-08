import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    const tweet = new Tweet({
        content,
        owner: req.user._id
    })
    await tweet.save()
    res.status(201).json(new ApiResponse(201, "Tweet created successfully", tweet));
})

const getUserTweets = asyncHandler(async (req, res) => { // Fetch tweets by user
    const userId = req.user._id
    const tweets = await Tweet.find({ owner: userId })
        .populate("owner", "-password -refreshToken") // Populate owner details excluding sensitive fields
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
    res.status(200).json(new ApiResponse(200, "User tweets fetched successfully", tweets));
})

const updateTweet = asyncHandler(async (req, res) => { // Update a tweet
    const {tweetId} = req.params
    const { content } = req.body
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const tweet = await Tweet.findById(tweetId); // Check if tweet exists
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    tweet.content = content; // Update content
    await tweet.save();
    res.status(200).json(new ApiResponse(200, "Tweet updated successfully", tweet));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const tweet = await Tweet.findById(tweetId); // Check if tweet exists
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    await tweet.remove();
    res.status(200).json(new ApiResponse(200, "Tweet deleted successfully", tweet));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
