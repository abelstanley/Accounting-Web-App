import Account from "../models/Account.js";

// GET all accounts
export const getAllAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find().sort({ accountCode: 1 });

    res.status(200).json({
      success: true,
      message: "Accounts retrieved successfully.",
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

// POST a new account
export const createAccount = async (req, res, next) => {
  try {
    const { accountCode, accountName, accountType, description } = req.body;

    if (!accountCode || !accountName || !accountType) {
      return res.status(400).json({
        success: false,
        message: "accountCode, accountName, and accountType are required.",
      });
    }

    const existing = await Account.findOne({ accountCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An account with code "${accountCode}" already exists.`,
      });
    }

    const account = await Account.create({
      accountCode,
      accountName,
      accountType,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};