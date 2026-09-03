import Formula from "../models/Formula.js";
import { calculateStoredFormula } from "../services/formulaService.js";
import { extractVariables, validateFormulaExpression } from "../services/formulaService.js";

// Controller to create a new formula
export const createFormula = async (req, res) => {
    try {
        const {
            name,
            code,
            expression,
            description,
            category,
        } = req.body;

        validateFormulaExpression(expression);
        
        const variables = extractVariables(expression);

        const formula = await Formula.create({
            name,
            code,
            expression,
            variables,
            description,
            category,
            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: "Formula created successfully.",
            data: formula,
        });
    } catch (error) {
        console.error("Create formula error:", error);

        res.status(400).json({
            success: false,
            message: "Invalid formula data.",
            error: error.message,
        });
    }
}

// Controller to retrieve all formulas
export const getFormulas = async (req, res) => {
    try {
        const formulas = await Formula.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Formulas retrieved successfully.",
            count: formulas.length,
            data: formulas,
        });
    } catch (error) {
        console.error("Get formulas error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve formulas.",
            error: error.message,
        });
    }
};

// Controller to retrieve a single formula by ID
export const getFormula = async (req, res) => {
    try {
        const { id } = req.params;

        const formula = await Formula.findById(id);

        if (!formula) {
            return res.status(404).json({
                success: false,
                message: "Formula not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Formula retrieved successfully.",
            data: formula,
        });
    } catch (error) {
        console.error("Get formula error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve formula.",
            error: error.message,
        });
    }
};

// Controller to update a formula by ID
export const updateFormula = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            code,
            expression,
            description,
            category,
        } = req.body;

        const formula = await Formula.findById(id);

        if (!formula) {
            return res.status(404).json({
                success: false,
                message: "Formula not found.",
            });
        }

        if (name !== undefined) {
            formula.name = name;
        }

        if (code !== undefined) {
            formula.code = code;
        }

        if (expression !== undefined) {
            formula.expression = expression;
            formula.variables = extractVariables(expression);
        }

        if (description !== undefined) {
            formula.description = description;
        }

        if (category !== undefined) {
            formula.category = category;
        }
        formula.version += 1;
        await formula.save();

        res.status(200).json({
            success: true,
            message: "Formula updated successfully.",
            data: formula,
        });
    } catch (error) {
        console.error("Update formula error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update formula.",
            error: error.message,
        });
    }
};

// Controller to delete a formula by ID
export const deleteFormula = async (req, res) => {
    try {
        const { id } = req.params;

        const formula = await Formula.findById(id);

        if (!formula) {
            return res.status(404).json({
                success: false,
                message: "Formula not found.",
            });
        }

        await Formula.deleteOne({ _id: id });

        res.status(200).json({
            success: true,
            message: "Formula deleted successfully.",
        });
    } catch (error) {
        console.error("Delete formula error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete formula.",
            error: error.message,
        });
    }
};

// Controller to calculate a stored formula by its code
export const calculateStoredFormulaController = async (req, res) => {
    try {
        const { code } = req.params;
        const { values } = req.body;

        if (!values || typeof values !== "object" || Array.isArray(values)) {
            return res.status(400).json({
                success: false,
                message: "Values must be provided as an object.",
            });
        }

        const result = await calculateStoredFormula(code, values);

        res.status(200).json({
            success: true,
            message: "Formula calculated successfully.",
            data: result,
        });
    } catch (error) {
        console.error("Calculate formula error:", error);

        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}; 