import mongoose from "mongoose";
import Account from "../models/Account.js";
import Journal from "../models/Journal.js";


export const postJournal = async (req, res, next) => {
  try {
    const { transactionDate, description, lines } = req.body;


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
      (sum, line) => sum + (line.debit || 0),
      0
    );

    const totalCredit = lines.reduce(
      (sum, line) => sum + (line.credit || 0),
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
  createdBy: req.user._id,
};

// Create the journal entry in the database
const journal = await Journal.create(journalData);

   res.status(201).json({
  success: true,
  message: "Journal created successfully.",
  data: journal,
});

  } catch (error) {
    next(error);
  }
};