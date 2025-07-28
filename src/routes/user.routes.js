import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route('/register')
  .post((req, res) => {
    // Call the registerUser controller
    registerUser(req, res);
  });

export default router;