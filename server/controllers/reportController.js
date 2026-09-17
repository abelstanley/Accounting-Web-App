import Account from "../models/Account.js";
import Ledger from "../models/Ledger.js";

export const getTrialBalance = async (req, res, next) => {
  try {
    const accounts = await Account.find({ isActive: true });

    const trialBalance = [];

    for (const account of accounts) {
      const ledgerEntries = await Ledger.find({
        account: account._id,
      });

      let totalDebit = 0;
      let totalCredit = 0;

      for (const entry of ledgerEntries) {
        totalDebit += entry.debit;
        totalCredit += entry.credit;
      }

      trialBalance.push({
        accountId: account._id,
        accountCode: account.accountCode,
        accountName: account.accountName,
        accountType: account.accountType,
        totalDebit,
        totalCredit,
      });
    }

    res.status(200).json({
      success: true,
      message: "Trial Balance generated successfully.",
      data: trialBalance,
    });
  } catch (error) {
    next(error);
  }
}; 