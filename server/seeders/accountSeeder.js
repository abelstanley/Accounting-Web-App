// seeders/accountSeeder.js

import Account from "../models/Account.js";

const defaultAccounts = [
  {
    accountCode: "1000",
    accountName: "Cash",
    accountType: "Asset",
  },
  {
    accountCode: "1100",
    accountName: "Bank",
    accountType: "Asset",
  },
  {
    accountCode: "1200",
    accountName: "Accounts Receivable",
    accountType: "Asset",
  },
  {
    accountCode: "2000",
    accountName: "Accounts Payable",
    accountType: "Liability",
  },
  {
    accountCode: "3000",
    accountName: "Owner's Equity",
    accountType: "Equity",
  },
  {
    accountCode: "4000",
    accountName: "Sales Revenue",
    accountType: "Revenue",
  },
  {
    accountCode: "5000",
    accountName: "Rent Expense",
    accountType: "Expense",
  },
];

const seedAccounts = async () => {
  try {
    const count = await Account.countDocuments();

    if (count === 0) {
      await Account.insertMany(defaultAccounts);
      console.log("Default Chart of Accounts seeded successfully.");
    } else {
      console.log("Chart of Accounts already exists. Skipping seeding.");
    }
  } catch (error) {
    console.error("Error seeding Chart of Accounts:", error.message);
  }
};

export default seedAccounts;