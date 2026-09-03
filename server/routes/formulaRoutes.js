import express from "express";
import {
  createFormula,
  getFormulas,
  getFormula,
  updateFormula,
  deleteFormula,
  calculateStoredFormulaController,
} from "../controllers/formulaController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createFormula);
router.get("/", protect, getFormulas);
router.get("/:id", protect, getFormula);
router.patch("/:id", protect, updateFormula);
router.delete("/:id", protect, deleteFormula);
router.post("/:code/calculate", protect, calculateStoredFormulaController);

export default router;