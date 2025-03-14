const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

exports.generateReferralCode = asyncHandler(async (length = 8) => {
    let numericCode = "";
    while (numericCode.length < length) {
        const uuid = uuidv4();
        const numericPart = uuid.replace(/[^0-9]/g, "");

        const remainingLength = length - numericCode.length;
        numericCode += numericPart.substring(0, remainingLength);
    }
    return numericCode;
});
