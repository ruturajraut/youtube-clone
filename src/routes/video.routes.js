import { Router } from "express";
import {
  createVideo,
  updateVideo,
  deleteVideo,
  getAllVideos,
  getVideoById,
  toggleVideoPublishStatus
} from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js"; // for video uploads (if needed)

const router = Router();

// Public route to get videos (can add filters/pagination in controller)
router.route("/")
  .get(getAllVideos);

// Get single video by ID (optional: make public or protected)
router.route("/:videoId")
  .get(getVideoById);

// Create a video (protected + file upload if needed)
router.route("/")
  .post(
    verifyJwt,
    upload.fields([
      { name: 'videoFile', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 }
    ]),
    createVideo
  );

// Update video details
router.route("/:videoId")
  .patch(
    verifyJwt,
    upload.fields([
      { name: 'thumbnail', maxCount: 1 }
    ]),
    updateVideo
  );

// Delete video
router.route("/:videoId")
  .delete(verifyJwt, deleteVideo);

// Toggle publish/unpublish
router.route("/:videoId/publish-toggle")
  .patch(verifyJwt, toggleVideoPublishStatus);

export default router;
