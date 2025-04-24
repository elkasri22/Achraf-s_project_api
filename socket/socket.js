const asyncHandler = require("express-async-handler");
const socketIo = require('socket.io');
const Match = require("../Models/matches.model");
const cron = require('node-cron');
const { encryptData } = require("../utils/cryptData");

module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ['GET', 'POST']
        }
    });

    // Store connected sockets
    const connectedSockets = new Map();

    // Improved sendMatches function
    const sendMatches = asyncHandler(async (matches) => {
        try {
            // Broadcast to all connected clients
            const enCodedMatches = await encryptData(matches);
            io.emit("matches", enCodedMatches);

        } catch (error) {
            console.error('Error sending matches:', error);
            throw error; // Re-throw to handle in the route
        }
    });

    const GetAllMatches = asyncHandler(async (req, res, next) => {
        async function getSortedMatches() {
            const matches = await Match.find().select("-createdAt -updatedAt -__v");

            const sortedMatches = [...matches].sort((a, b) => {
                const isFootballA = a.type === 'football';
                const isFootballB = b.type === 'football';

                if (isFootballA && !isFootballB) return -1;

                if (!isFootballA && isFootballB) return 1;

                return b.isFirst - a.isFirst;
            });

            return sortedMatches;
        }

        const data = await getSortedMatches();

        return {
            data,
        }
    });

    // Improved updateMatchesToLive function to update matches to "live" status
    async function updateMatchesToLive() {
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().substring(0, 5);

        console.log(currentDate, currentTime);

        // Update matches to "live" status if date and time are less than now instead of find
        const updateResult = await Match.updateMany(
            {
                status: "upcoming",
                // date: { $lte: currentDate },
                // time: { $lte: currentTime }
                $or: [
                    { date: { $lt: currentDate } },
                    { date: currentDate, time: { $lte: currentTime } }
                ]
            },
            { $set: { status: 'live' } }
        );

        // Get matches only if there are updates
        if (updateResult.modifiedCount > 0) {
            const matches = await GetAllMatches();
            return matches;
        }
        return null;
    };

    // Update matches every minute outside the socket
    cron.schedule('* * * * *', async () => {
        try {
            const updatedMatches = await updateMatchesToLive();
            if (updatedMatches) {
                // Improved sendMatches function 
                await sendMatches(updatedMatches);
            };
        } catch (error) {
            console.error('Error updating matches:', error);
        }
    });

    io.on('connection', async (socket) => {

        // Store the socket if you need user-specific communication
        connectedSockets.set(socket.id, socket);

        // Broadcast to all connected clients
        if (connectedSockets.size > 0) {
            const matches = await GetAllMatches();
            await sendMatches(matches);
        }

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            connectedSockets.delete(socket.id);
        });

        socket.on('error', (err) => {
            console.error(`Socket error from ${socket.id}:`, err);
        });
    });

    // Return both io and sendMatches for external use
    module.exports.sendMatches = sendMatches;
};