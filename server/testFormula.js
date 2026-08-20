import { calculateFormula } from "./services/formulaService.js";

const result = calculateFormula(
  "ROUND(AVERAGE(REVENUE, SUM(OTHER_REVENUE, EXPENSES), CASH), 2)",
  {
    REVENUE: 100000,
    OTHER_REVENUE: 20000,
    EXPENSES: 50000,
    CASH: 30000,
    
  }
);

console.log(result);