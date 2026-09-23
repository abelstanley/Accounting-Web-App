import mongoose from "mongoose";
import dotenv from "dotenv";
import journalSchema from "../server/models/Journal.js";

dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // Find every journal with no category set at all
    const result = await journalSchema.updateMany(
        { category: { $exists: false } },
        { $set: { category: "Operating" } }
    );

    console.log(`Backfilled ${result.modifiedCount} journal entries with category "Operating".`);

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
});