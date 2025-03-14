const MountRoutes = (app) => {
    //* Routes for authorization
    app.use(`${process.env.VERSION_API}/auth`, require("./auth"));
    //* Routes for csrf token
    app.use(`${process.env.VERSION_API}/csrf`, require("./csrf"));
    //* Routes for levels
    app.use(`${process.env.VERSION_API}/levels`, require("./levels"));
    //* Routes for tapHere
    app.use(`${process.env.VERSION_API}/tapHere`, require("./tapHere"));
    //* Routes for vouchers
    app.use(`${process.env.VERSION_API}/vouchers`, require("./vouchers"));
    //* Routes for make-videos
    app.use(`${process.env.VERSION_API}/make-videos`, require("./make-videos"));
    //* Routes for payments
    app.use(`${process.env.VERSION_API}/payments`, require("./payments"));
    //* Routes for Withdraw The Balance
    app.use(`${process.env.VERSION_API}/withdrawTheBalance`, require("./withdrawTheBalance"));
    //* Routes for Withdraw The Points Videos
    app.use(`${process.env.VERSION_API}/withdrawThePointVideos`, require("./withdrawThePointVideos"));
};

module.exports = MountRoutes;