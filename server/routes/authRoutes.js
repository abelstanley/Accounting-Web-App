import express from "express";
import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";
import {
    registerUser,
    loginUser,
    getUserProfile,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.get("/admin", protect, authorize("admin"), (req, res) => {
        res.json({
            success: true,
            message: "Welcome Admin!",
        });
    }
);

export default router; 