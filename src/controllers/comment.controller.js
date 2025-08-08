import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"




const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Convert to integers
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  // Query comments for the given videoId
  const comments = await Comment.find({ video: videoId })
    .populate("owner", "-password -refreshToken") // populate user info excluding sensitive fields
    .sort({ createdAt: -1 }) // Newest comments first
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  const totalComments = await Comment.countDocuments({ video: videoId });

  res.status(200).json(
    new ApiResponse(200, {
      comments,
      totalPages: Math.ceil(totalComments / limitNumber),
      currentPage: pageNumber,
      totalComments
    })
  );
});


const addComment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { videoId } = req.params;
  const { content } = req.body;

  // Validation
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Create comment
  const comment = await Comment.create({
    content,
    owner: userId,
    video: videoId
  });

  // Optional: populate owner info
  const populatedComment = await comment.populate("owner", "-password -refreshToken");

  res.status(201).json(new ApiResponse(201, populatedComment, "Comment added successfully"));
});


const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const userId = req.user._id;
  const { commentId } = req.params;
  const { content } = req.body;

  // Validate input
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Updated comment content is required");
  }

  // Find the comment
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if the logged-in user is the owner
  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  // Update content
  comment.content = content;
  await comment.save();

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
})


const deleteComment = asyncHandler(async (req, res) => {
      const userId = req.user._id;
  const { commentId } = req.params;

  // 1. Check if the comment exists
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // 2. Check if the user is the owner of the comment
  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  // 3. Delete the comment
  await comment.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }