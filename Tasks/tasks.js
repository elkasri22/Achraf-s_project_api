const cron = require("node-cron");
const User = require("../Models/users.model");

// Run the task every minute
// exports.checkLastTapAndLoginUser = cron.schedule('* * * * *', async () => {

// Run the task every 7 days
exports.checkLastTapAndLoginUser = cron.schedule("0 0 * * 0", async () => {
  // Get all users who have not logged in for 7 days (7 * 24 * 60 * 60 * 1000)

  //   Get all users who have not logged in for 1 minute (1 * 60 * 1000)

  const users = await User.find({
    $or: [
      { lastLogin: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      { lastTap: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    ],
  });

  // Decrease the points of each user
  if (users.length > 0) {
    users.forEach(async (user) => {
      if (user.score.level.points >= process.env.DECREASE_EACH_WEEK_THIS_POINTS) {
        user.score.level.points -= process.env.DECREASE_EACH_WEEK_THIS_POINTS;
        user.hideLevelPoints -= process.env.DECREASE_EACH_WEEK_THIS_POINTS;
      }else {
        user.score.level.points = 0;
        user.hideLevelPoints = 0;
      };
      await user.save();
    });
  };
});

// Run the task every minute
// exports.sendEveryDayNotification = cron.schedule("* * * * *", async () => {
// Run the task every day
exports.sendEveryDayNotification = cron.schedule('0 12 * * *', async () => {
//   Get all users and send them a notification

  const messagesMotivation = [
    "It's new day!! let's play!!",
    "Don't give up!! let's play!!",
    "You can do it!! let's play!!",
    "Believe in yourself!!",
    "You're doing great!!",
    "Keep going!!",
    "Don't lose hope!!",
    "You're almost there!!",
    "Stay focused!!",
    "You got this!!",
    "It's time to shine!!",
    "Make today count!!",
    "You're stronger than you think!!",
    "Keep pushing!!",
    "Don't give up on your dreams!!",
    "You're capable of amazing things!!",
    "Stay positive!!",
    "You're doing better than you think!!",
    "Keep moving forward!!",
    "You're on the right path!!",
  ];

  const users = await User.find({});

  if(users.length > 0){
    users.forEach(async (user) => {
      user.notifications.push(
        messagesMotivation[Math.floor(Math.random() * messagesMotivation.length)]
      );
      await user.save();
    });
  };
});

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

// Run the task every minute
// exports.ResetTapHereEveryDay = cron.schedule("* * * * *", async () => {
// Run the task every day
exports.ResetTapHereEveryDay = cron.schedule('0 12 * * *', async () => {
  // Get all users and update tapHere.day to null and tapHere.length to 0 
  const users = await User.find({clicked: { $ne: 0 } });

  if(users.length > 0){
    users.forEach(async (user) => {
      user.tapHere.day = null;
      user.tapHere.length = 0;
      user.clicked = 0;
      await user.save();
    });
  };
});