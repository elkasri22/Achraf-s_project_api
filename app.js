const express = require("express");
const app = express();
const connectDB = require("./Config/db/connectDB");
const helmet = require("helmet");
const cors = require("cors");
const { NotFound, ErrorHandler } = require("./Middlewares/HandleErrors");
const cookieParser = require("cookie-parser");
const ErrorOutSideExpress = require("./utils/ErrorOutSideExpress");
const xss = require("./Middlewares/xss");
const rate_limit = require("./Middlewares/rate_limit");
const bodyParser = require("body-parser");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const MountRoutes = require("./Routes/main");
const middlewareCryptData = require("./Middlewares/middlewareCryptData");
const compression = require("compression");

//* Apply dotenv
require("dotenv").config();

//* Apply Tasks
const tasks = require("./Tasks/tasks");

//* Apply Connect Database
connectDB();

app.use(
    compression({
        filter: (req, res) => {
            if (req.headers["x-no-compression"]) {
                return false;
            }
            return compression.filter(req, res);
        },
        threshold: 1024, // ضغط الاستجابات التي يزيد حجمها عن 1 كيلوبايت
        level: 6, // مستوى الضغط (من 1 إلى 9، حيث 9 هو الأفضل)
        memLevel: 8, // مستوى الذاكرة المستخدمة للضغط (من 1 إلى 9)
    })
);

app.use(express.urlencoded({ extended: true }));

//* Apply Middleware express json with specific larger to uploaded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "5mb" }));

//* Apply Middleware cookie-parser
app.use(cookieParser());

//* Apply Middleware helmet
app.use(helmet());

//* Apply Middleware cors
app.use(
    cors({
        origin: "*",
        // origin: ["https://apkw.site", "http://localhost:3000"],
    })
);

// * Middleware to protect against HTTP Parameter Pollution attacks
app.use(hpp());

//* Middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection.
app.use(mongoSanitize());

//* Middleware express rate limit to prevent from Dos or DDOS Attack
app.use("/api", rate_limit);

//* Apply middleware tasks
tasks.RemoveAllOtpUserAfter5Minutes.start();

//* Apply middleware xss(cross site scripting)
app.use(xss);

//* Apply middleware middlewareCryptData
// app.use(middlewareCryptData); // TODO: When i complete i have to apply this middleware

//* Apply routes
MountRoutes(app);

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

//* User Middleware Handle Errors
app.all("*", NotFound);
app.use(ErrorHandler);

ErrorOutSideExpress(server);
