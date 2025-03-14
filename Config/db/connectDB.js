const { default: mongoose } = require("mongoose");
const asyncHandler = require("express-async-handler");

const connectDB = asyncHandler(async () => {
    mongoose.connect(process.env.URL_DB);
    console.log("Database is connected");
});

module.exports = connectDB;