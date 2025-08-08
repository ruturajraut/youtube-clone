import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const video = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(req.user._id) } },// Match videos by owner

        { $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner"
        }},
        { $unwind: "$owner" },
        { $project: {
            videoFile: 1,
            thumbnail: 1,
            title: 1,
            description: 1,
            duration: 1,
            views: 1,
            isPublished: 1,
            owner: {
                _id: "$owner._id",
                username: "$owner.username",
                fullname: "$owner.fullname",
                avatar: "$owner.avatar"
            }
        }},
        { $sort: { [sortBy || 'createdAt']: sortType === 'desc' ? -1 : 1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }

    ])
    if (!video || video.length === 0) {
        throw new ApiError(404, "No videos found")
    }
    res.status(200).json(new ApiResponse(200, "Videos fetched successfully", video));


})


const createVideo = asyncHandler(async (req, res) => {
  const { title, description, videoFile, thumbnail } = req.body;

  // Validate required fields
  if (!title || !description || !videoFile || !thumbnail) {
    throw new ApiError(400, "Title, description, video file, and thumbnail are required");
  }

  // Create new video in database
  const video = await Video.create({
    title,
    description,
    videoFile,
    thumbnail,
    owner: req.user._id // assuming you have user info in the request (e.g., via auth middleware)
  });

  // Send success response
  return res.status(201).json(
    new ApiResponse(201, video, "Video uploaded successfully")
  );
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const { videoFile, thumbnail } = req.files

    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }
    // Upload video and thumbnail to Cloudinary
    const videoFileResponse = await uploadOnCloudinary(videoFile.path);
    const thumbnailResponse = await uploadOnCloudinary(thumbnail.path);

    // Create video
    const video = await Video.create({
        title,
        description,
        videoFile: videoFileResponse.secure_url,
        thumbnail: thumbnailResponse.secure_url,
        owner: req.user._id
    });

    res.status(201).json(new ApiResponse(201, "Video published successfully", video));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "-password -refreshToken");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, "Video fetched successfully", video));
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Apply updates
    if (title) video.title = title;
    if (description) video.description = description;
    if (thumbnail) video.thumbnail = thumbnail;

    await video.save();

    // Populate owner after update
    await video.populate("owner", "-password -refreshToken");

    res.status(200).json(new ApiResponse(200, "Video updated successfully", video));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    await video.remove();

    res.status(200).json(new ApiResponse(200, "Video deleted successfully"));
});

const toggleVideoPublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json(new ApiResponse(200, "Video publish status toggled successfully", video));
});



export { getAllVideos, publishAVideo, getVideoById, createVideo, updateVideo, deleteVideo, toggleVideoPublishStatus };