
const MountRoutes = (app) => {
    //* Routes for authorization
    app.use(`${process.env.VERSION_API}/auth`, require("./auth"));
    //* Routes for csrf token
    app.use(`${process.env.VERSION_API}/csrf`, require("./csrf"));
    //* Routes for apps
    app.use(`${process.env.VERSION_API}/apps`, require("./apps"));
    //* Routes for emails
    app.use(`${process.env.VERSION_API}/emails`, require("./emails"));
};

module.exports = MountRoutes;