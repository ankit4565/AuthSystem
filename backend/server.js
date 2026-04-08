const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
require("dotenv").config({ path: path.resolve("./.env") });

const app = express();

// connect DB
connectDB();

app.use(express.json());
app.use(
	cors({
		origin: ["http://localhost:5174", "http://127.0.0.1:5174"],
		credentials: true,
	})
);

app.use("/api/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));