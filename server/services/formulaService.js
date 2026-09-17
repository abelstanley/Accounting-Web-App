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

    // Check for expressions ending with an arithmetic operator
    if (/[+\-*/]$/.test(trimmedExpression)) {
        throw new Error(
            "Formula expression cannot end with an arithmetic operator."
        );
    }

    // Check for consecutive arithmetic operators, allowing whitespace between them
    if (/[+\-*/]\s*[+\-*/]/.test(trimmedExpression)) {
        throw new Error(
            "Formula expression contains consecutive arithmetic operators."
        );
    }

    // Check for empty function arguments
    if (/\(\s*,|,\s*,|,\s*\)/.test(trimmedExpression)) {
        throw new Error(
            "Formula expression contains an empty function argument."
        );
    }

    // Check for unsupported functions
    const supportedFunctions = ["SUM", "AVERAGE", "IF", "ROUND"];

    const functionMatches = trimmedExpression.match(
        /\b[A-Za-z_][A-Za-z0-9_]*\s*\(/g
    ) || [];

    for (const functionMatch of functionMatches) {
        const functionName = functionMatch
            .replace(/\s*\($/, "")
            .toUpperCase();

        if (!supportedFunctions.includes(functionName)) {
            throw new Error(
                `Unsupported formula function: ${functionName}`
            );
        }
    }

    // Check function argument counts
    const functionPattern = /\b(SUM|AVERAGE|IF|ROUND)\s*\(([^()]*)\)/gi;

    let functionMatch;

    while ((functionMatch = functionPattern.exec(trimmedExpression)) !== null) {
        const functionName = functionMatch[1].toUpperCase();

        const argumentsString = functionMatch[2].trim();

        const argumentsList = argumentsString
            ? argumentsString.split(",").map((item) => item.trim())
            : [];

        switch (functionName) {
            case "SUM":
            case "AVERAGE":
                if (argumentsList.length < 1) {
                    throw new Error(
                        `${functionName} requires at least one argument.`
                    );
                }
                break;

            case "IF":
                if (argumentsList.length !== 3) {
                    throw new Error(
                        "IF requires exactly three arguments."
                    );
                }
                break;

            case "ROUND":
                if (argumentsList.length !== 2) {
                    throw new Error(
                        "ROUND requires exactly two arguments."
                    );
                }
                break;
        }
    }

    // Check for supported functions used without parentheses
    const malformedFunctionPattern =
        /\b(SUM|AVERAGE|IF|ROUND)\b(?!\s*\()/gi;

    const malformedFunctionMatch =
        trimmedExpression.match(malformedFunctionPattern);

    if (malformedFunctionMatch) {
        throw new Error(
            `Malformed formula function: ${malformedFunctionMatch[0]}`
        );
    }

    // Validate IF conditions
    const ifPattern = /\bIF\s*\(([^()]*)\)/gi;

    let ifMatch;

    while ((ifMatch = ifPattern.exec(trimmedExpression)) !== null) {
        const argumentsString = ifMatch[1];

        const argumentsList = argumentsString
            .split(",")
            .map((item) => item.trim());

        const condition = argumentsList[0];

        const comparisonMatch = condition.match(
            /^(.+?)\s*(>=|<=|==|!=|>|<)\s*(.+)$/
        );

        if (!comparisonMatch) {
            throw new Error(
                "IF condition must contain a valid comparison operator."
            );
        }

        const [, leftSide, operator, rightSide] = comparisonMatch;

        // Prevent unsupported or repeated comparison operators
        if (/[<>!=]/.test(leftSide) || /[<>!=]/.test(rightSide)) {
            throw new Error(
                "IF condition contains an unsupported comparison operator."
            );
        }
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

// Helper function to find an active formula by its code
const findActiveFormula = async (code) => {
    return Formula.findOne({
        code,
        active: true,
    });
};

// Service to calculate a stored formula by its code
export const calculateStoredFormula = async (
    code,
    values = {},
    calculationStack = []
) => {
    const formula = await findActiveFormula(code);

    if (!formula) {
        throw new Error(`Active formula not found: ${code}`);
    }

    if (calculationStack.includes(code)) {
        const dependencyPath = [...calculationStack, code].join(" → ");

        throw new Error(
            `Circular formula dependency detected: ${dependencyPath}`
        );
    }

    calculationStack.push(code);

    for (const variable of formula.variables) {
        if (Object.prototype.hasOwnProperty.call(values, variable)) {
            continue;
        }

        const dependency = await findActiveFormula(variable);

        if (!dependency) {
            throw new Error(
                `Missing required value for variable: ${variable}`
            );
        }
    }

    for (const variable of formula.variables) {
        if (Object.prototype.hasOwnProperty.call(values, variable)) {
            const value = values[variable];

            if (typeof value !== "number" || !Number.isFinite(value)) {
                throw new Error(
                    `Invalid value for variable: ${variable}`
                );
            }

            continue;
        }

        const dependency = await findActiveFormula(variable);

        if (dependency) {
            const dependencyResult = await calculateStoredFormula(
                variable,
                values,
                calculationStack
            );

            values[variable] = dependencyResult.result;
        }
    }

    return calculateFormula(formula.expression, values);
}; 