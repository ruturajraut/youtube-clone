import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJwt); // Apply verifyJwt middleware to all routes in this file

router.route("/").post(createTweet);  // Create a new tweet

router.route("/user/:userId").get(getUserTweets); // Fetch tweets by user
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet); // Update or delete a tweet by ID

export default router;