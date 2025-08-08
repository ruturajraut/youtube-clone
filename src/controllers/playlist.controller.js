import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId = req.user._id;

    // Validation
    if (!name) {
        throw new ApiError(400, "Playlist name is required");
    }
    
    // Check if user already has a playlist with the same name
    const existingPlaylist = await Playlist.findOne({ name, owner: userId });
    if (existingPlaylist) {
        throw new ApiError(409, "Playlist with this name already exists");
    }

    // Create playlist
    const playlist = await Playlist.create({
        name,
        description,
        owner: userId,
    });

    res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));
    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
   const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const playlists = await Playlist.find({ owner: userId }).sort({ createdAt: -1 });

    res
        .status(200)
        .json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
});



const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("videos") // Optional: Populate videos if you store video references
        .populate("owner", "username email"); // Optional: Populate owner info (only specific fields)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate inputs
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and Video ID are required");
    }

    // Check if playlist exists
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if the video is already in the playlist
    const alreadyExists = playlist.videos.includes(videoId);
    if (alreadyExists) {
        throw new ApiError(409, "Video already exists in the playlist");
    }

    // Add video to playlist
    playlist.videos.push(videoId);
    await playlist.save();

    res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});



const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate input
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and Video ID are required");
    }

    // Find the playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check if video exists in playlist
    const index = playlist.videos.indexOf(videoId);
    if (index === -1) {
        throw new ApiError(404, "Video not found in playlist");
    }

    // Remove the video from playlist
    playlist.videos.splice(index, 1);
    await playlist.save();

    res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});


const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Validate input
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    // Find and delete the playlist
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    );
});


const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    // Validate playlist ID
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    // Validate update fields
    if (!name && !description) {
        throw new ApiError(400, "At least one field (name or description) must be provided");
    }

    // Find and update the playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $set: { ...(name && { name }), ...(description && { description }) } },
        { new: true } // return the updated document
    );

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}