const { v2: cloudinary } = require("cloudinary");
const asyncHandler = require("express-async-handler");

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET, 
});

const cloudinaryUploadImage = asyncHandler(async (file) => {
    const data = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
    });

    return data;
});

const cloudinaryDeleteImage = asyncHandler(async (id) => {
    const data = await cloudinary.uploader.destroy(id);

    return data;
});

module.exports = { cloudinaryUploadImage, cloudinaryDeleteImage };