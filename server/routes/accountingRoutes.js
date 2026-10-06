import express from "express";
import {
    postJournal,
    reverseJournal,
    editJournal,
    getAllJournals,
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

// PUT /api/accounting/journal/:journalId/edit
router.put(
    "/journal/:journalId/edit",
    protect,
    editJournal
);

// GET /api/accounting/journals
router.get("/journals", protect, getAllJournals);

export default router;