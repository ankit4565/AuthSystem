const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
require("dotenv").config({ path: path.resolve("./.env") });

const app = express();

// connect DB
connectDB();

app.use(express.json());
const allowedOrigins = 
[
	  "https://auth-system-omega-ashy.vercel.app",
	"http://localhost:5175",
	"http://localhost:5173"
];

app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
	})
);

app.options("*", cors({ origin: allowedOrigins, credentials: true }));

app.use("/api/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));