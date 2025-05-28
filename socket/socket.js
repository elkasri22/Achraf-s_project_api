const asyncHandler = require("express-async-handler");
const socketIo = require('socket.io');
const Match = require("../Models/matches.model");
const cron = require('node-cron');
const { encryptData } = require("../utils/cryptData");
const moment = require('moment-timezone');

module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "https://sportbn.com",
            methods: ['GET', 'POST']
        }
    });

    let cachedMatches = { data: [] }; 

    // دالة لإرسال المباريات لجميع المستخدمين
    const sendMatches = asyncHandler(async (matches) => {
        try {
            const enCodedMatches = await encryptData(matches);
            io.emit("matches", enCodedMatches);
            console.log(`Sent ${matches.data.length} matches to ${io.engine.clientsCount} connected clients.`);
        } catch (error) {
            console.error('Error sending matches:', error);
            throw error;
        }
    });

    // ✅ دالة جديدة لإرسال البيانات إلى Socket واحد فقط
    const sendMatchesToOne = asyncHandler(async (socket, matches) => {
        try {
            const enCodedMatches = await encryptData(matches);
            socket.emit("matches", enCodedMatches);
            console.log(`Sent ${matches.data.length} matches to socket: ${socket.id}`);
        } catch (error) {
            console.error(`Error sending to one socket (${socket.id}):`, error);
        }
    });

    async function getSortedMatchesFromDB() {
        const matches = await Match.find().select("-createdAt -updatedAt -__v");

        const sortedMatches = [...matches].sort((a, b) => {
            const isFootballA = a.type === 'football';
            const isFootballB = b.type === 'football';

            if (isFootballA && !isFootballB) return -1;
            if (!isFootballA && isFootballB) return 1;

            return b.isFirst - a.isFirst;
        });

        return { data: sortedMatches };
    };

    const GetAllMatches = asyncHandler(async () => {
        if (cachedMatches && cachedMatches.data.length > 0) {
            return cachedMatches;
        }
        const data = await getSortedMatchesFromDB();
        cachedMatches = data;
        return data;
    });

    async function updateMatchesToLive() {
        const nowServer = new Date();
        const casablancaTime = moment(nowServer).tz('Africa/Casablanca');
        const currentDateCasablanca = casablancaTime.format('YYYY-MM-DD');
        const currentTimeCasablanca = casablancaTime.format('HH:mm');

        const updateResult = await Match.updateMany({
            status: 'upcoming',
            $or: [
                { date: { $lt: currentDateCasablanca } },
                { date: currentDateCasablanca, time: { $lte: currentTimeCasablanca } },
            ]
        }, { $set: { status: 'live' } });

        if (updateResult.modifiedCount > 0) {
            console.log(`Updated ${updateResult.modifiedCount} matches to 'live' status.`);
            const matches = await getSortedMatchesFromDB();
            cachedMatches = matches;
            return matches;
        }
        return null;
    };

    cron.schedule('* * * * *', async () => {
        try {
            console.log('Running cron job: Checking for live matches and sending updates...');
            const updatedMatches = await updateMatchesToLive();
            if (updatedMatches) {
                await sendMatches(updatedMatches);
            } else if (cachedMatches && cachedMatches.data.length > 0) {
                await sendMatches(cachedMatches);
            }
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    });

    (async () => {
        try {
            console.log("Fetching initial matches for caching...");
            cachedMatches = await getSortedMatchesFromDB();
            console.log("Initial matches cached.");
        } catch (error) {
            console.error("Error fetching initial matches for caching:", error);
        }
    })();

    io.on('connection', async (socket) => {
        console.log(`Client connected: ${socket.id}. Total clients: ${io.engine.clientsCount}`);

        if (cachedMatches && cachedMatches.data.length > 0) {
            await sendMatchesToOne(socket, cachedMatches); // ✅ استخدام الدالة الجديدة هنا
        } else {
            const matches = await getSortedMatchesFromDB();
            cachedMatches = matches;
            await sendMatchesToOne(socket, matches);
        }

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}. Total clients: ${io.engine.clientsCount}`);
        });

        socket.on('error', (err) => {
            console.error(`Socket error from ${socket.id}:`, err);
        });
    });

    // تصدير sendMatches أيضاً إن أردت استخدامه خارج الملف
    module.exports.sendMatches = sendMatches;
};
