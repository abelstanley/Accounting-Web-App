import { extractVariables } from "./services/formulaService.js";
import { validateFormulaExpression } from "./services/formulaService.js";

const expressions = [
    "REVENUE - COST_OF_SALES",
    "ROUND((REVENUE - COST_OF_SALES) / REVENUE * 100, 2)",
    "IF(PROFIT > 0, PROFIT, 0)",
    "REVENUE + @@@",
    "SUM(REVENUE",
];

for (const expression of expressions) {
    try {
        validateFormulaExpression(expression);

        console.log(`VALID: ${expression}`);
    } catch (error) {
        console.log(`INVALID: ${expression}`);
        console.log(`Reason: ${error.message}`);
    }
}