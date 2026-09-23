import Ledger from "../models/Ledger.js";
import Account from "../models/Account.js";

// Helper function to build a MongoDB date filter from optional query params
const buildDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate || endDate) {
    filter.transactionDate = {};
    if (startDate) filter.transactionDate.$gte = new Date(startDate);
    if (endDate) filter.transactionDate.$lte = new Date(endDate);
  }
  return filter;
};

// GET /api/reports/trial-balance
export const getTrialBalance = async (req, res, next) => {
  try {
    // Sum all debits and credits per account in one database pass
    const ledgerTotals = await Ledger.aggregate([
      {
        $group: {
          _id: "$account",
          totalDebit: { $sum: "$debit" },
          totalCredit: { $sum: "$credit" },
        },
      },
    ]);

    // Quick lookup: accountId -> { totalDebit, totalCredit }
    const totalsMap = new Map(
      ledgerTotals.map((t) => [t._id.toString(), t])
    );

    const accounts = await Account.find({ isActive: true }).sort({
      accountCode: 1,
    });

    const trialBalance = accounts.map((account) => {
      const totals = totalsMap.get(account._id.toString()) || {
        totalDebit: 0,
        totalCredit: 0,
      };

      const net = totals.totalDebit - totals.totalCredit;

      return {
        accountId: account._id,
        accountCode: account.accountCode,
        accountName: account.accountName,
        accountType: account.accountType,
        debit: net >= 0 ? net : 0,
        credit: net < 0 ? Math.abs(net) : 0,
      };
    });

    const totalDebit = trialBalance.reduce((sum, a) => sum + a.debit, 0);
    const totalCredit = trialBalance.reduce((sum, a) => sum + a.credit, 0);

    res.status(200).json({
      success: true,
      message: "Trial Balance generated successfully.",
      data: trialBalance,
      totals: {
        totalDebit,
        totalCredit,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/general-ledger/:accountId
export const getGeneralLedgerByAccountId = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { startDate, endDate } = req.query;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    const dateFilter = buildDateFilter(startDate, endDate);

    const entries = await Ledger.find({
      account: accountId,
      ...dateFilter,
    })
      .sort({ transactionDate: 1, createdAt: 1 })
      .populate("journal", "reference description"); // adjust fields to match your Journal model

    res.status(200).json({
      success: true,
      message: "General Ledger retrieved successfully.",
      data: {
        account: {
          accountId: account._id,
          accountCode: account.accountCode,
          accountName: account.accountName,
          accountType: account.accountType,
        },
        entries,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/general-ledger
export const getGeneralLedgerAll = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const accounts = await Account.find({ isActive: true }).sort({
      accountCode: 1,
    });

    const entries = await Ledger.find(dateFilter)
      .sort({ transactionDate: 1, createdAt: 1 })
      .populate("journal", "reference description");

    // Group entries by account so each account has its own list
    const entriesByAccount = new Map();
    for (const entry of entries) {
      const key = entry.account.toString();
      if (!entriesByAccount.has(key)) entriesByAccount.set(key, []);
      entriesByAccount.get(key).push(entry);
    }

    const generalLedger = accounts.map((account) => ({
      accountId: account._id,
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      entries: entriesByAccount.get(account._id.toString()) || [],
    }));

    res.status(200).json({
      success: true,
      message: "General Ledger (all accounts) retrieved successfully.",
      data: generalLedger,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/income-statement 
export const getIncomeStatement = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required for an Income Statement.",
      });
    }

    const dateFilter = buildDateFilter(startDate, endDate);

    // Sum debit/credit per account within the date range
    const ledgerTotals = await Ledger.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$account",
          totalDebit: { $sum: "$debit" },
          totalCredit: { $sum: "$credit" },
        },
      },
    ]);

    const totalsMap = new Map(
      ledgerTotals.map((t) => [t._id.toString(), t])
    );

    // Only Revenue and Expense accounts belong on an Income Statement
    const accounts = await Account.find({
      isActive: true,
      accountType: { $in: ["Revenue", "Expense"] },
    }).sort({ accountCode: 1 });

    const revenueAccounts = [];
    const expenseAccounts = [];

    for (const account of accounts) {
      const totals = totalsMap.get(account._id.toString()) || {
        totalDebit: 0,
        totalCredit: 0,
      };

      if (account.accountType === "Revenue") {
        const amount = totals.totalCredit - totals.totalDebit;
        revenueAccounts.push({
          accountId: account._id,
          accountCode: account.accountCode,
          accountName: account.accountName,
          amount,
        });
      } else {
        const amount = totals.totalDebit - totals.totalCredit;
        expenseAccounts.push({
          accountId: account._id,
          accountCode: account.accountCode,
          accountName: account.accountName,
          amount,
        });
      }
    }

    const totalRevenue = revenueAccounts.reduce((sum, a) => sum + a.amount, 0);
    const totalExpense = expenseAccounts.reduce((sum, a) => sum + a.amount, 0);
    const netIncome = totalRevenue - totalExpense;

    res.status(200).json({
      success: true,
      message: "Income Statement generated successfully.",
      data: {
        period: { startDate, endDate },
        revenue: {
          accounts: revenueAccounts,
          total: totalRevenue,
        },
        expenses: {
          accounts: expenseAccounts,
          total: totalExpense,
        },
        netIncome,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/balance-sheet
export const getBalanceSheet = async (req, res, next) => {
  try {
    const asOfDate = req.query.asOfDate ? new Date(req.query.asOfDate) : new Date();

    // Everything up to and including asOfDate
    const dateFilter = { transactionDate: { $lte: asOfDate } };

    const ledgerTotals = await Ledger.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$account",
          totalDebit: { $sum: "$debit" },
          totalCredit: { $sum: "$credit" },
        },
      },
    ]);
    const totalsMap = new Map(ledgerTotals.map((t) => [t._id.toString(), t]));

    const accounts = await Account.find({ isActive: true }).sort({ accountCode: 1 });

    const assets = [];
    const liabilities = [];
    const equity = [];
    let totalRevenue = 0;
    let totalExpense = 0;

    for (const account of accounts) {
      const totals = totalsMap.get(account._id.toString()) || {
        totalDebit: 0,
        totalCredit: 0,
      };

      const line = {
        accountId: account._id,
        accountCode: account.accountCode,
        accountName: account.accountName,
      };

      switch (account.accountType) {
        case "Asset":
          assets.push({ ...line, amount: totals.totalDebit - totals.totalCredit });
          break;
        case "Liability":
          liabilities.push({ ...line, amount: totals.totalCredit - totals.totalDebit });
          break;
        case "Equity":
          equity.push({ ...line, amount: totals.totalCredit - totals.totalDebit });
          break;
        case "Revenue":
          totalRevenue += totals.totalCredit - totals.totalDebit;
          break;
        case "Expense":
          totalExpense += totals.totalDebit - totals.totalCredit;
          break;
      }
    }

    const netIncome = totalRevenue - totalExpense;

    // Fold current-period net income into equity until closing entries exist (step 50 extension)
    equity.push({
      accountId: null,
      accountCode: null,
      accountName: "Retained Earnings (Current Period)",
      amount: netIncome,
    });

    const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.amount, 0);
    const totalEquity = equity.reduce((sum, a) => sum + a.amount, 0);

    res.status(200).json({
      success: true,
      message: "Balance Sheet generated successfully.",
      data: {
        asOfDate,
        assets: { accounts: assets, total: totalAssets },
        liabilities: { accounts: liabilities, total: totalLiabilities },
        equity: { accounts: equity, total: totalEquity },
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/cash-flow-statement

export const getCashFlowStatement = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required for a Cash Flow Statement.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Find the cash-equivalent account IDs (Cash, Bank, etc.)
    const cashAccounts = await Account.find({ isCashEquivalent: true });
    const cashAccountIds = cashAccounts.map((a) => a._id);

    if (cashAccountIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No accounts are flagged as isCashEquivalent. Cannot generate Cash Flow Statement.",
      });
    }

    // Pull cash-account ledger entries in range, joined to their journal's category
    const cashFlowByCategory = await Ledger.aggregate([
      {
        $match: {
          account: { $in: cashAccountIds },
          transactionDate: { $gte: start, $lte: end },
        },
      },
      {
        $lookup: {
          from: "journals",
          localField: "journal",
          foreignField: "_id",
          as: "journalInfo",
        },
      },
      { $unwind: "$journalInfo" },
      {
        $group: {
          _id: "$journalInfo.category",
          netCash: { $sum: { $subtract: ["$debit", "$credit"] } },
        },
      },
    ]);

    // Turn the aggregation result into a predictable shape (all 3 categories always present)
    const categories = { Operating: 0, Investing: 0, Financing: 0 };
    for (const entry of cashFlowByCategory) {
      if (entry._id in categories) {
        categories[entry._id] = entry.netCash;
      }
    }

    const netChangeInCash = categories.Operating + categories.Investing + categories.Financing;

    // Opening cash balance: net of all cash-account entries BEFORE startDate
    const openingAgg = await Ledger.aggregate([
      {
        $match: {
          account: { $in: cashAccountIds },
          transactionDate: { $lt: start },
        },
      },
      {
        $group: {
          _id: null,
          balance: { $sum: { $subtract: ["$debit", "$credit"] } },
        },
      },
    ]);
    const openingCash = openingAgg[0]?.balance || 0;
    const closingCash = openingCash + netChangeInCash;

    res.status(200).json({
      success: true,
      message: "Cash Flow Statement generated successfully.",
      data: {
        period: { startDate, endDate },
        operatingActivities: categories.Operating,
        investingActivities: categories.Investing,
        financingActivities: categories.Financing,
        netChangeInCash,
        openingCash,
        closingCash,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Reusable: sums Revenue/Expense accounts for one date range
const getRevenueExpenseTotals = async (start, end) => {
  const dateFilter = { transactionDate: { $gte: start, $lte: end } };

  const ledgerTotals = await Ledger.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: "$account",
        totalDebit: { $sum: "$debit" },
        totalCredit: { $sum: "$credit" },
      },
    },
  ]);
  const totalsMap = new Map(ledgerTotals.map((t) => [t._id.toString(), t]));

  const accounts = await Account.find({
    isActive: true,
    accountType: { $in: ["Revenue", "Expense"] },
  }).sort({ accountCode: 1 });

  const byAccount = {};
  let totalRevenue = 0;
  let totalExpense = 0;

  for (const account of accounts) {
    const totals = totalsMap.get(account._id.toString()) || {
      totalDebit: 0,
      totalCredit: 0,
    };

    const amount =
      account.accountType === "Revenue"
        ? totals.totalCredit - totals.totalDebit
        : totals.totalDebit - totals.totalCredit;

    byAccount[account._id.toString()] = {
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      amount,
    };

    if (account.accountType === "Revenue") totalRevenue += amount;
    else totalExpense += amount;
  }

  return { byAccount, totalRevenue, totalExpense, netIncome: totalRevenue - totalExpense };
};

// Percentage change helper — handles the "previous was 0" edge case
const percentChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : null; // null = "not meaningful" (infinite % from 0)
  return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(2));
};

// GET /api/reports/profit-and-loss-comparison
export const getProfitAndLoss = async (req, res, next) => {
  try {
    const { currentStart, currentEnd, previousStart, previousEnd } = req.query;

    if (!currentStart || !currentEnd) {
      return res.status(400).json({
        success: false,
        message: "currentStart and currentEnd are required.",
      });
    }

    const curStart = new Date(currentStart);
    const curEnd = new Date(currentEnd); 
    curEnd.setUTCHours(23, 59, 59, 999); // treat the end date as inclusive of the whole day

    // Auto-calculate previous period (same length, immediately before) if not explicitly given
    let prevStart, prevEnd;
    if (previousStart && previousEnd) {
      prevStart = new Date(previousStart);
      prevEnd = new Date(previousEnd);
    } else {
      const periodLengthMs = curEnd.getTime() - curStart.getTime();
      prevEnd = new Date(curStart.getTime() - 1); // 1ms before current period starts
      prevStart = new Date(prevEnd.getTime() - periodLengthMs);
    }

    const current = await getRevenueExpenseTotals(curStart, curEnd);
    const previous = await getRevenueExpenseTotals(prevStart, prevEnd);

    // Build a per-account comparison, covering accounts present in EITHER period
    const allAccountIds = new Set([
      ...Object.keys(current.byAccount),
      ...Object.keys(previous.byAccount),
    ]);

    const accountComparison = [...allAccountIds].map((id) => {
      const cur = current.byAccount[id];
      const prev = previous.byAccount[id];
      const info = cur || prev; // whichever period has it, for name/code/type
      const curAmount = cur?.amount || 0;
      const prevAmount = prev?.amount || 0;

      return {
        accountCode: info.accountCode,
        accountName: info.accountName,
        accountType: info.accountType,
        current: curAmount,
        previous: prevAmount,
        change: curAmount - prevAmount,
        percentChange: percentChange(curAmount, prevAmount),
      };
    });

    res.status(200).json({
      success: true,
      message: "Profit & Loss comparison generated successfully.",
      data: {
        currentPeriod: { startDate: currentStart, endDate: currentEnd },
        previousPeriod: {
          startDate: prevStart.toISOString(),
          endDate: prevEnd.toISOString(),
        },
        accounts: accountComparison,
        summary: {
          revenue: {
            current: current.totalRevenue,
            previous: previous.totalRevenue,
            change: current.totalRevenue - previous.totalRevenue,
            percentChange: percentChange(current.totalRevenue, previous.totalRevenue),
          },
          expenses: {
            current: current.totalExpense,
            previous: previous.totalExpense,
            change: current.totalExpense - previous.totalExpense,
            percentChange: percentChange(current.totalExpense, previous.totalExpense),
          },
          netIncome: {
            current: current.netIncome,
            previous: previous.netIncome,
            change: current.netIncome - previous.netIncome,
            percentChange: percentChange(current.netIncome, previous.netIncome),
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};