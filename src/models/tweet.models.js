import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Content is required'],
        maxlength: [280, 'Content cannot exceed 280 characters']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

},{timestamps: true});

const Tweet = mongoose.model("Tweet", tweetSchema);
export { Tweet };
