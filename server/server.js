import dotenv from "dotenv";
import express from "express";
import routes from "./routes/index.js";
import authRoutes from "./routes/authRoutes.js";
import accountingRoutes from "./routes/accountingRoutes.js";
import connectDB from "./config/db.js";
import morgan from "morgan";
import errorHandler from "./middleware/errorHandler.js";
import seedAccounts from "./seeders/accountSeeder.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(express.json());
await connectDB();
await seedAccounts(); 

// Use all routes
app.use(routes);
app.use("/api/auth", authRoutes);
app.use("/api/accounting", accountingRoutes);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`); 
});