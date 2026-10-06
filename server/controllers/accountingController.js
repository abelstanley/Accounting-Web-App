import mongoose from "mongoose";
import Account from "../models/Account.js";
import Journal from "../models/Journal.js";
import Ledger from "../models/Ledger.js";

// Helper function to recalculate ledger balances for a specific account
const recalculateLedgerBalances = async (accountId, session) => {
    const account = await Account.findById(accountId).session(session);

    if (!account) {
        throw new Error("Account not found while recalculating ledger balance.");
    }

    const ledgerEntries = await Ledger.find({
        account: accountId,
    })
        .sort({ transactionDate: 1, createdAt: 1 })
        .session(session);

    let balance = 0;

    for (const entry of ledgerEntries) {
        if (
            account.accountType === "Asset" ||
            account.accountType === "Expense"
        ) {
            balance += entry.debit - entry.credit;
        } else {
            balance += entry.credit - entry.debit;
        }

        entry.balance = balance;

        await entry.save({ session });
    }
};
// Controller function to handle posting a journal and ledger entry
export const postJournal = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { transactionDate, description, lines, category } = req.body;

        // Validate category — must be one of the allowed values
        const validCategories = ["Operating", "Investing", "Financing"];
        if (category && !validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(", ")}.`,
            });
        }


        // Validate that the journal entry has at least two lines
        if (!lines || lines.length < 2) {
            return res.status(400).json({
                success: false,
                message: "A journal entry must contain at least two lines.",
            });
        }


        // Validate that each line has either a debit or a credit amount, but not both
        for (const line of lines) {
            const debit = Number(line.debit || 0);
            const credit = Number(line.credit || 0);

            if ((debit > 0 && credit > 0) || (debit === 0 && credit === 0)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Each journal line must contain either a debit or a credit amount, but not both.",
                });
            }
        }


        // Validate that each account in the journal lines exists in the database
        for (const line of lines) {
            if (!mongoose.Types.ObjectId.isValid(line.account)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid account ID: ${line.account}`,
                });
            }

            const account = await Account.findById(line.account);

            if (!account) {
                return res.status(400).json({
                    success: false,
                    message: `Account not found: ${line.account}`,
                });
            }
        }

        // Calculate total debits and credits to ensure the journal entry is balanced
        const totalDebit = lines.reduce(
            (sum, line) => sum + Number(line.debit || 0),
            0
        );

        const totalCredit = lines.reduce(
            (sum, line) => sum + Number(line.credit || 0),
            0
        );
        if (totalDebit !== totalCredit) {
            return res.status(400).json({
                success: false,
                message: "Journal entry is not balanced. Total debits must equal total credits.",
            });
        }

        // If all validations pass, proceed to create the journal entry 

        // Create the object for the new journal entry
        const journalData = {
            transactionDate,
            description,
            lines,
            category: category || "Operating", // Default to "Operating" if not provided
            status: "Posted",
            createdBy: req.user._id,

        };

        // Create the journal entry in the database
        const [journal] = await Journal.create([journalData], { session });

        // Create a ledger entry for each journal line
        for (const line of journal.lines) {

            //const account = await Account.findById(line.account);

            // const previousLedger = await Ledger.findOne({
            //     account: line.account,
            // }).sort({ transactionDate: -1, createdAt: -1 });

            // const previousBalance = previousLedger
            //     ? previousLedger.balance
            //     : 0;

            // let balance;

            // if (
            //     account.accountType === "Asset" ||
            //     account.accountType === "Expense"
            // ) {
            //     balance = previousBalance + line.debit - line.credit;
            // } else {
            //     balance = previousBalance + line.credit - line.debit;
            // } 

            await Ledger.create(
                [
                    {
                        account: line.account,
                        journal: journal._id,
                        transactionDate: journal.transactionDate,
                        description: journal.description,
                        debit: line.debit,
                        credit: line.credit,
                        balance: 0, // Initial balance will be recalculated later
                    },
                ],
                { session }
            );

            // Recalculate ledger balances for the account after adding the new entry
            await recalculateLedgerBalances(line.account, session);
        }
        await session.commitTransaction();
        res.status(201).json({
            success: true,
            message: "Journal created successfully.",
            data: journal,
        });

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        await session.endSession();
    }
};

// Controller function to reverse a posted journal
export const reverseJournal = async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { journalId } = req.params;

        // Find the original journal
        const journal = await Journal.findById(journalId).session(session);

        if (!journal) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Journal not found.",
            });
        }

        // Only posted journals can be reversed
        if (journal.status !== "Posted") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Only posted journals can be reversed.",
            });
        }

        // Prevent a journal from being reversed more than once
        if (journal.reversedBy) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "This journal has already been reversed.",
            });
        }

        // Reversal logic will be added here step by step

        // Create reversal lines by swapping debit and credit
        const reversalLines = journal.lines.map((line) => ({
            account: line.account,
            debit: line.credit,
            credit: line.debit,
        }));

        // Create the reversal journal
        const reversalJournalData = {
            transactionDate: new Date(),
            description: `Reversal of: ${journal.description}`,
            lines: reversalLines,
            category: journal.category, // Keep the same category as the original journal
            status: "Posted",
            isReversal: true,
            reversedJournal: journal._id,
            reversedBy: req.user._id,
            createdBy: req.user._id
        };

        const [reversalJournal] = await Journal.create(
            [reversalJournalData],
            { session }
        );

        // Create ledger entries for the reversal
        for (const line of reversalJournal.lines) {
            await Ledger.create(
                [
                    {
                        account: line.account,
                        journal: reversalJournal._id,
                        transactionDate: reversalJournal.transactionDate,
                        description: reversalJournal.description,
                        debit: line.debit,
                        credit: line.credit,
                        balance: 0,
                    },
                ],
                { session }
            );
        }

        // Recalculate balances for all affected accounts
        for (const line of reversalJournal.lines) {
            await recalculateLedgerBalances(line.account, session);
        }

        // Link the original journal to the reversal journal
        journal.reversedBy = reversalJournal._id;

        await journal.save({ session });

        // Commit all reversal changes
        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Journal reversed successfully.",
            data: reversalJournal,
        });

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        await session.endSession();
    }
};

// Controller function to edit a journal
export const editJournal = async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { journalId } = req.params;

        // Find the journal to edit
        const journal = await Journal.findById(journalId).session(session);

        if (!journal) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Journal not found.",
            });
        }

        // Only draft journals can be edited
        if (journal.status !== "Draft") {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Only draft journals can be edited.",
            });
        }

        // Reversal journals cannot be edited
        if (journal.isReversal) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Reversal journals cannot be edited.",
            });
        }

        // Get the updated journal data from the request
        const { transactionDate, description, lines, category } = req.body;

        // Validate that the updated journal has at least two lines
        if (!lines || lines.length < 2) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "A journal entry must contain at least two lines.",
            });
        }

        // Validate that each line has either a debit or a credit amount, but not both
        for (const line of lines) {
            const debit = Number(line.debit || 0);
            const credit = Number(line.credit || 0);

            if ((debit > 0 && credit > 0) || (debit === 0 && credit === 0)) {
                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message:
                        "Each journal line must contain either a debit or a credit amount, but not both.",
                });
            }
        }

        // Validate that each account in the updated journal exists
        for (const line of lines) {
            if (!mongoose.Types.ObjectId.isValid(line.account)) {
                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message: `Invalid account ID: ${line.account}`,
                });
            }

            const account = await Account.findById(line.account).session(session);

            if (!account) {
                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message: `Account not found: ${line.account}`,
                });
            }
        }

        // Calculate total debits and credits
        const totalDebit = lines.reduce(
            (sum, line) => sum + Number(line.debit || 0),
            0
        );

        const totalCredit = lines.reduce(
            (sum, line) => sum + Number(line.credit || 0),
            0
        );


        // Validate the category if provided

        const validCategories = ["Operating", "Investing", "Financing"];
        if (category && !validCategories.includes(category)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(", ")}.`,
            });
        }

        // Ensure the updated journal is balanced
        if (totalDebit !== totalCredit) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message:
                    "Journal entry is not balanced. Total debits must equal total credits.",
            });
        }

        // Update the draft journal
        journal.transactionDate = transactionDate;
        journal.description = description;
        journal.lines = lines;
        if (category) journal.category = category; // only overwrite if a new value was sent

        await journal.save({ session });

        // Commit the changes
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Draft journal updated successfully.",
            data: journal,
        });


    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        await session.endSession();
    }
};

// GET all journals, most recent first
export const getAllJournals = async (req, res, next) => {
  try {
    const journals = await Journal.find()
      .sort({ transactionDate: -1, createdAt: -1 })
      .limit(20) // most recent 20, to keep the page fast
      .populate("lines.account", "accountCode accountName");

    res.status(200).json({
      success: true,
      message: "Journals retrieved successfully.",
      data: journals,
    });
  } catch (error) {
    next(error);
  }
};