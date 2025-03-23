const CryptoJS = require('crypto-js');

module.exports = (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
        if (res.getHeader('Content-Type') && res.getHeader('Content-Type').includes('application/json')) {
        try {
            const secretKey = process.env.ENCRYPTION_KEY;

            if (!secretKey) {
            console.error('ENCRYPTION_KEY is not defined in environment variables.');
            return originalSend.call(this, body); // Send original if key is missing
            }

            const encryptedData = CryptoJS.AES.encrypt(body, secretKey).toString();
            res.setHeader('Content-Type', 'application/json'); // Ensure content type is still JSON
            return originalSend.call(this, JSON.stringify({ encrypted: encryptedData })); // Send encrypted data as JSON
        } catch (error) {
            console.error('Encryption error:', error);
            return originalSend.call(this, body); // Send original on error
        }
        }
        return originalSend.call(this, body); // Send original if not JSON
    };

    next();
};