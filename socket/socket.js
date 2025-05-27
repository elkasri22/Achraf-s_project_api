const asyncHandler = require("express-async-handler");
const socketIo = require('socket.io');
const Match = require("../Models/matches.model");
const cron = require('node-cron');
const { encryptData } = require("../utils/cryptData");
const moment = require('moment-timezone');

module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ['GET', 'POST']
        }
    });

    // لم نعد بحاجة إلى connectedSockets Map لأننا نرسل بثًا عامًا فقط
    // const connectedSockets = new Map(); 

    // متغير لتخزين المباريات المجلوبة مؤقتاً في الذاكرة
    let cachedMatches = { data: [] }; 

    // Improved sendMatches function
    const sendMatches = asyncHandler(async (matches) => {
        try {
            // Broadcast to all connected clients
            const enCodedMatches = await encryptData(matches);
            io.emit("matches", enCodedMatches);
            console.log(`Sent ${matches.data.length} matches to ${io.engine.clientsCount} connected clients.`);

        } catch (error) {
            console.error('Error sending matches:', error);
            throw error; // Re-throw to handle in the route
        }
    });

    // دالة لجلب وفرز المباريات من قاعدة البيانات
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

    // دالة GetAllMatches ستستخدم البيانات المخزنة مؤقتاً
    const GetAllMatches = asyncHandler(async () => {
        // إذا كانت البيانات المخزنة مؤقتاً موجودة، أعدها
        if (cachedMatches && cachedMatches.data.length > 0) {
            return cachedMatches;
        }
        // وإلا، قم بجلبها من قاعدة البيانات وتخزينها مؤقتاً
        const data = await getSortedMatchesFromDB();
        cachedMatches = data; // تخزين البيانات بعد جلبها
        return data;
    });

    // Improved updateMatchesToLive function to update matches to "live" status
    async function updateMatchesToLive() {
        // 1. Get current date and time from the server
        const nowServer = new Date();

        // 2. Convert current date and time to Casablanca time
        const casablancaTime = moment(nowServer).tz('Africa/Casablanca');
        const currentDateCasablanca = casablancaTime.format('YYYY-MM-DD');
        const currentTimeCasablanca = casablancaTime.format('HH:mm');

        // 3. Get all matches that are "upcoming" and their date is less than or equal to the current date and their time is less than or equal to the current time
        const updateResult = await Match.updateMany({
            status: 'upcoming',
            $or: [
                {
                    date: { $lt: currentDateCasablanca },
                },
                {
                    date: currentDateCasablanca,
                    time: { $lte: currentTimeCasablanca },
                },
            ]}, { $set: { status: 'live' } });

        // Get matches only if there are updates
        if (updateResult.modifiedCount > 0) {
            console.log(`Updated ${updateResult.modifiedCount} matches to 'live' status.`);
            const matches = await getSortedMatchesFromDB(); // جلب المباريات المحدثة من DB
            cachedMatches = matches; // تحديث الذاكرة المؤقتة
            return matches;
        }
        return null; // لا توجد تحديثات
    };

    // Update matches every minute outside the socket
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

    // تشغيل جلب المباريات وتخزينها مؤقتاً عند بدء السيرفر لأول مرة
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
        // لم نعد بحاجة لتخزين الـ socket في Map
        // connectedSockets.set(socket.id, socket); 

        // عند اتصال عميل جديد، أرسل له المباريات المخزنة مؤقتاً مباشرة
        if (cachedMatches && cachedMatches.data.length > 0) {
            await sendMatches(cachedMatches);
        } else {
            const matches = await getSortedMatchesFromDB();
            cachedMatches = matches; 
            await sendMatches(matches);
        }

        socket.on('disconnect', () => {
            // لم نعد بحاجة لحذف من Map
            // connectedSockets.delete(socket.id); 
            console.log(`Client disconnected: ${socket.id}. Total clients: ${io.engine.clientsCount}`);
        });

        socket.on('error', (err) => {
            console.error(`Socket error from ${socket.id}:`, err);
        });
    });

    // Return both io and sendMatches for external use
    module.exports.sendMatches = sendMatches;
};
