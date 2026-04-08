// config/db.js

const mongoose = require("mongoose");
const User = require("../models/users");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        await User.syncIndexes();
    } catch (error) {
        console.log("DB Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;