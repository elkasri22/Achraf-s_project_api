const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { chromium } = require("playwright");
const { WebSiteFootball } = require("../utils/global");

/**
 * @desc GET ALL LEAGUES
 * @route /api/v1/bot/leagues
 * @method GET
 * @access public
 */
exports.GetAllLeagues = asyncHandler(async (req, res, next) => {
    
    const browser = await chromium.launch({
        headless: false
    });

    const context = await browser.newContext();

    const page = await context.newPage();

    await page.goto(WebSiteFootball, { waitUntil: "load"});

    setTimeout(async() => {
        await page.close();
    }, 5000);

    console.log("== GET ALL LEAGUES");

    res.status(200).json({ status: "success" });
});
