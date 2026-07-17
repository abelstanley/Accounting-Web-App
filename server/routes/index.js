import express from "express";

const router = express.Router();

// Home Route
router.get("/", (req, res) => {
    res.send("Welcome to the Accounting Web App API");
});

// Health Check Route
router.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Accounting API is running successfully"
    });
});

export default router;