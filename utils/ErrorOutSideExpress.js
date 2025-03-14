
const ErrorOutSideExpress = (server) => {
    process.on("unhandledRejection", (err) => {
        console.log(`== UnhandledRejection Error: ${err.message}`);
        server.close(() => {
            console.log(`Shutting down the server due to unhandled Promise rejection`);
            process.exit(1);
        });
    });
};

module.exports = ErrorOutSideExpress;