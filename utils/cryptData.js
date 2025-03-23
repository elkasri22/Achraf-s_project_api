const CryptoJS = require('crypto-js');

exports.encryptData = (data) => {
    const secretKey = process.env.ENCRYPTION_KEY;
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

// exports.decryptData = (encryptedData) => {
//     const secretKey = process.env.ENCRYPTION_KEY;
//     const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
//     return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// }