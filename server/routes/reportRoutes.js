import express from "express";
import { getTrialBalance } from "../controllers/reportController.js";

const router = express.Router();

router.get("/trial-balance", getTrialBalance);

export default router;