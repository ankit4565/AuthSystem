const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
require("dotenv").config({ path: path.resolve("./.env") });

const app = express();

// connect DB
connectDB();

app.use(express.json());
const allowedOrigins = [
	"https://auth-system-omega-ashy.vercel.app",
	"http://localhost:5175",
	"http://localhost:5173",
];

const corsOptions = {
	origin(origin, callback) {
		if (!origin || allowedOrigins.includes(origin)) {
			return callback(null, true);
		}

		return callback(new Error("Not allowed by CORS"));
	},
	credentials: true,
	optionsSuccessStatus: 204,
};

app.use(
	cors(corsOptions)
);

app.options(/.*/, cors(corsOptions));

app.use("/api/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));