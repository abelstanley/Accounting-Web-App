import Formula from "../models/Formula.js";

// Helper function to extract variable names from a formula expression
export const extractVariables = (expression) => {
    if (typeof expression !== "string") {
        throw new Error("Formula expression must be a string.");
    }

    const supportedFunctions = [
        "SUM",
        "AVERAGE",
        "IF",
        "ROUND",
    ];

    const matches = expression.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];

    const variables = matches.filter((item) => {
        return !supportedFunctions.includes(item.toUpperCase());
    });

    return [...new Set(variables)];
};

// Helper function to validate formula expression syntax
export const validateFormulaExpression = (expression) => {
    if (!expression) {
        throw new Error("Formula expression is required.");
    }

    if (typeof expression !== "string") {
        throw new Error("Formula expression must be a string.");
    }

    const trimmedExpression = expression.trim();

    if (!trimmedExpression) {
        throw new Error("Formula expression cannot be empty.");
    }

    // Check for unsupported characters
    if (!/^[A-Za-z0-9_+\-*/().,\s<>=!]+$/.test(trimmedExpression)) {
        throw new Error(
            "Formula expression contains unsupported characters."
        );
    }

    // Check that parentheses are balanced
    let parenthesisCount = 0;

    for (const character of trimmedExpression) {
        if (character === "(") {
            parenthesisCount++;
        }

        if (character === ")") {
            parenthesisCount--;

            if (parenthesisCount < 0) {
                throw new Error(
                    "Formula expression contains unbalanced parentheses."
                );
            }
        }
    }

    if (parenthesisCount !== 0) {
        throw new Error(
            "Formula expression contains unbalanced parentheses."
        );
    }

    return true;
};

// Formula calculation service - helper function to resolve variable names to their numeric values
const resolveValue = (item, values) => {
    const trimmedItem = item.trim();

    // Direct variable lookup
    if (Object.prototype.hasOwnProperty.call(values, trimmedItem)) {
        const value = values[trimmedItem];

        if (typeof value !== "number" || !Number.isFinite(value)) {
            throw new Error(`Invalid value for variable: ${trimmedItem}`);
        }

        return value;
    }

    // Direct numeric value
    const numericValue = Number(trimmedItem);

    if (Number.isFinite(numericValue)) {
        return numericValue;
    }

    // Replace variables inside an arithmetic expression
    let arithmeticExpression = trimmedItem;

    for (const [key, value] of Object.entries(values)) {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            throw new Error(`Invalid value for variable: ${key}`);
        }

        const variablePattern = new RegExp(`\\b${key}\\b`, "g");

        arithmeticExpression = arithmeticExpression.replace(
            variablePattern,
            value.toString()
        );
    }

    // Only allow numbers, decimal points, spaces and arithmetic operators
    if (!/^[0-9+\-*/().\s]+$/.test(arithmeticExpression)) {
        throw new Error(`Invalid expression: ${trimmedItem}`);
    }

    const result = Function(
        `"use strict"; return (${arithmeticExpression})`
    )();

    if (typeof result !== "number" || !Number.isFinite(result)) {
        throw new Error(`Invalid calculation result: ${trimmedItem}`);
    }

    return result;
};

// Helper function to process formula functions from inside outwards, ensuring that nested functions are evaluated correctly
const processFunctions = (expression, values) => {
    const functionPattern = /(SUM|AVERAGE|IF|ROUND)\(([^()]*)\)/gi;

    let processedExpression = expression;

    while (functionPattern.test(processedExpression)) {
        processedExpression = processedExpression.replace(
            functionPattern,
            (match, functionName, argumentsString) => {
                const argumentsList = argumentsString
                    .split(",")
                    .map((item) => item.trim());

                switch (functionName.toUpperCase()) {
                    case "SUM": {
                        if (argumentsList.length === 0) {
                            throw new Error("SUM requires at least one value.");
                        }

                        let sum = 0;

                        for (const argument of argumentsList) {
                            sum += resolveValue(argument, values);
                        }

                        return sum.toString();
                    }

                    case "AVERAGE": {
                        if (argumentsList.length === 0) {
                            throw new Error("AVERAGE requires at least one value.");
                        }

                        let total = 0;

                        for (const argument of argumentsList) {
                            total += resolveValue(argument, values);
                        }

                        return (total / argumentsList.length).toString();
                    }

                    case "IF": {
                        if (argumentsList.length !== 3) {
                            throw new Error(
                                "IF requires exactly three arguments: condition, valueIfTrue, valueIfFalse."
                            );
                        }

                        const [condition, valueIfTrue, valueIfFalse] = argumentsList;

                        const comparisonMatch = condition.match(
                            /^(.+?)\s*(>=|<=|==|!=|>|<)\s*(.+)$/
                        );

                        if (!comparisonMatch) {
                            throw new Error("Invalid IF condition.");
                        }

                        const [, leftSide, operator, rightSide] = comparisonMatch;

                        const leftValue = resolveValue(leftSide, values);
                        const rightValue = resolveValue(rightSide, values);

                        let conditionResult;

                        switch (operator) {
                            case ">":
                                conditionResult = leftValue > rightValue;
                                break;

                            case "<":
                                conditionResult = leftValue < rightValue;
                                break;

                            case ">=":
                                conditionResult = leftValue >= rightValue;
                                break;

                            case "<=":
                                conditionResult = leftValue <= rightValue;
                                break;

                            case "==":
                                conditionResult = leftValue === rightValue;
                                break;

                            case "!=":
                                conditionResult = leftValue !== rightValue;
                                break;

                            default:
                                throw new Error(`Unsupported IF operator: ${operator}`);
                        }

                        const selectedValue = conditionResult
                            ? valueIfTrue
                            : valueIfFalse;

                        return resolveValue(selectedValue, values).toString();
                    }

                    case "ROUND": {
                        if (argumentsList.length !== 2) {
                            throw new Error(
                                "ROUND requires exactly two arguments: value and decimal places."
                            );
                        }

                        const [valueArgument, decimalArgument] = argumentsList;

                        const value = resolveValue(valueArgument, values);
                        const decimalPlaces = resolveValue(
                            decimalArgument,
                            values
                        );

                        if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0) {
                            throw new Error(
                                "ROUND decimal places must be a non-negative integer."
                            );
                        }

                        const multiplier = 10 ** decimalPlaces;

                        const roundedValue =
                            Math.round((value + Number.EPSILON) * multiplier) /
                            multiplier;

                        return roundedValue.toString();
                    }

                    default:
                        throw new Error(
                            `Unsupported formula function: ${functionName}`
                        );
                }
            }
        );
    }

    return processedExpression;
};

// Formula calculation service
export const calculateFormula = (expression, values = {}) => {
    if (!expression) {
        throw new Error("Formula expression is required.");
    }

    if (typeof expression !== "string") {
        throw new Error("Formula expression must be a string.");
    }

    let parsedExpression = expression;

    parsedExpression = processFunctions(
        parsedExpression,
        values
    );


    // Replace variable names with their numeric values
    for (const [key, value] of Object.entries(values)) {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            throw new Error(`Invalid value for variable: ${key}`);
        }

        const variablePattern = new RegExp(`\\b${key}\\b`, "g");

        parsedExpression = parsedExpression.replace(
            variablePattern,
            value.toString()
        );
    }

    // Only allow numbers, decimal points, spaces and basic arithmetic operators
    if (!/^[0-9+\-*/().\s]+$/.test(parsedExpression)) {
        throw new Error("Formula contains unsupported characters or variables.");
    }

    // Calculate the expression
    const result = Function(
        `"use strict"; return (${parsedExpression})`
    )();

    if (typeof result !== "number" || !Number.isFinite(result)) {
        throw new Error("Formula calculation produced an invalid result.");
    }

    return {
        expression,
        values,
        result,
    };
};

export { processFunctions };

// Service to calculate a stored formula by its code
export const calculateStoredFormula = async (code, values = {}) => {
    const formula = await Formula.findOne({
        code,
        active: true,
    });

    if (!formula) {
        throw new Error(`Active formula not found: ${code}`);
    }

    for (const variable of formula.variables) {
        if (!Object.prototype.hasOwnProperty.call(values, variable)) {
            throw new Error(
                `Missing required value for variable: ${variable}`
            );
        }
    }

    for (const variable of formula.variables) {
    const value = values[variable];

    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error(
            `Invalid value for variable: ${variable}`
        );
    }
}

    return calculateFormula(formula.expression, values);
}; 