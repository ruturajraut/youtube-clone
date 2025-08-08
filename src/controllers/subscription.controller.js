import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    const userId = req.user._id;
    // Check if the user is already subscribed to the channel
    const existingSubscription = await Subscription.findOne({ subscriber: userId, channel: channelId });
    if (existingSubscription) {
        // User is already subscribed, so we unsubscribe them
        await Subscription.deleteOne({ subscriber: userId, channel: channelId });
        return res.status(200).json(new ApiResponse(200, "Unsubscribed from channel successfully"));
    } else {
        // User is not subscribed, so we subscribe them
        const newSubscription = new Subscription({
            subscriber: userId,
            channel: channelId
        });
        await newSubscription.save();
        return res.status(201).json(new ApiResponse(201, "Subscribed to channel successfully", newSubscription));
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "-password -refreshToken") // Populate subscriber details excluding sensitive fields
        .select("-channel"); // Exclude channel field from the response
    res.status(200).json(new ApiResponse(200, "Subscribers fetched successfully", subscribers));
    // You can also return the count of subscribers if needed
    // const subscriberCount = subscribers.length;  
    // res.status(200).json(new ApiResponse(200, "Subscribers fetched successfully", { subscribers, count: subscriberCount }));
})



// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }
    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "-password -refreshToken") // Populate channel details excluding sensitive fields
        .select("-subscriber"); // Exclude subscriber field from the response
    res.status(200).json(new ApiResponse(200, "Subscribed channels fetched successfully", subscriptions));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}