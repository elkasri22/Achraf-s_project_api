const rateLimit = require("express-rate-limit");

const rate_limit = rateLimit({
    windowMs: 5 * 60 * 1000, // 10 minutes
    max: 900000, // limit each IP to 2 requests per windowMs
    message: (req, res) => {
        return res.status(429).json({
            status: "error",
            message: "Too many requests, please try again later",
        })
    }
});

module.exports = rate_limit;