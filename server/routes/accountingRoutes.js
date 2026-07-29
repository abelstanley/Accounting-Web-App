import express from "express";
import { postJournal } from "../controllers/accountingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// POST /api/accounting/journal/post
router.post("/journal/post", protect, postJournal);

export default router;