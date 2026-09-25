import express from "express";
import {
    getAllAccounts,
    createAccount,
} from "../controllers/accountController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllAccounts);
router.post("/", protect, createAccount);

export default router;