const cron = require("node-cron");
const User = require("../Models/users.model");

// Run the task every minute
// exports.RemoveAllOtpUserAfter5Minutes = cron.schedule("* * * * *", async () => {
  // Run the task every 5 minutes
exports.RemoveAllOtpUserAfter5Minutes = cron.schedule('*/5 * * * *', async () => {
//   Get all users it not empty otp and update otp to null
    const users = await User.find({ otp: { $ne: null } });

    if(users.length > 0){
        users.forEach(async (user) => {
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();
        });
    };
});