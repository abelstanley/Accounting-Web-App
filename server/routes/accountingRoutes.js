import express from "express";
import {
    postJournal,
    reverseJournal,
} from "../controllers/accountingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// POST /api/accounting/journal/post
router.post("/journal/post", protect, postJournal);

// POST /api/accounting/journal/:journalId/reverse
router.post(
    "/journal/:journalId/reverse",
    protect,
    reverseJournal
);

export default router;