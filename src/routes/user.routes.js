import { Router } from "express";
import { loginUser, logoutUser, registerUser,refreshAccessToken } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js"; // Changed to default import
import { verifyJwt } from "../middlewares/auth.middleware.js"; // Import the JWT verification middleware

const router = Router();

router.route('/register')
  .post(
    upload.fields([
      { name: 'avatar', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 }
    ]),
    registerUser // <-- Pass directly
  );

router.route('/login')
  .post(loginUser);

  //secured routes
router.route('/logout')
.post(verifyJwt, logoutUser);

router.route('/refresh-token')
  .post(refreshAccessToken);

  



export default router;