import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle like for a video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const userId = req.user._id;
  const existingLike = await Like.findOne({ user: userId, video: videoId });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return res.status(200).json(new ApiResponse(200, "Like removed successfully"));
  } else {
    const newLike = await Like.create({ user: userId, video: videoId });
    return res.status(201).json(new ApiResponse(201, "Video liked successfully", newLike));
  }
});

// Toggle like for a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const userId = req.user._id;
  const existingLike = await Like.findOne({ user: userId, comment: commentId });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return res.status(200).json(new ApiResponse(200, "Comment like removed successfully"));
  } else {
    const newLike = await Like.create({ user: userId, comment: commentId });
    return res.status(201).json(new ApiResponse(201, "Comment liked successfully", newLike));
  }
});

// Toggle like for a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const userId = req.user._id;
  const existingLike = await Like.findOne({ user: userId, tweet: tweetId });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return res.status(200).json(new ApiResponse(200, "Tweet like removed successfully"));
  } else {
    const newLike = await Like.create({ user: userId, tweet: tweetId });
    return res.status(201).json(new ApiResponse(201, "Tweet liked successfully", newLike));
  }
});

// Get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedVideos = await Like.find({ user: userId, video: { $ne: null } })
    .populate("video")
    .select("-comment -tweet");

  res.status(200).json(new ApiResponse(200, "Liked videos fetched successfully", likedVideos));
});

// Get all liked comments
const getLikedComments = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedComments = await Like.find({ user: userId, comment: { $ne: null } })
    .populate("comment")
    .select("-video -tweet");

  res.status(200).json(new ApiResponse(200, "Liked comments fetched successfully", likedComments));
});

// Get all liked tweets
const getLikedTweets = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedTweets = await Like.find({ user: userId, tweet: { $ne: null } })
    .populate("tweet")
    .select("-video -comment");

  res.status(200).json(new ApiResponse(200, "Liked tweets fetched successfully", likedTweets));
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getLikedComments,
  getLikedTweets,
};
