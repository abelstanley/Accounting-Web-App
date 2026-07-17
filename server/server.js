import dotenv from "dotenv";
import express from "express";
import routes from "./routes/index.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Use all routes
app.use(routes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});