import express from "express";
import {
    getTrialBalance,
    getGeneralLedgerByAccountId,
    getGeneralLedgerAll,
    getIncomeStatement,
    getBalanceSheet,
    getCashFlowStatement,
    getProfitAndLoss
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/trial-balance", protect, getTrialBalance);
router.get("/general-ledger", protect, getGeneralLedgerAll);
router.get("/general-ledger/:accountId", protect, getGeneralLedgerByAccountId);
router.get("/income-statement", protect, getIncomeStatement);
router.get("/balance-sheet", protect, getBalanceSheet);
router.get("/cash-flow-statement", protect, getCashFlowStatement);
router.get("/profit-loss", protect, getProfitAndLoss);

export default router; 