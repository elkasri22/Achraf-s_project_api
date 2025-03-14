const asyncHandler = require("express-async-handler");
/**********************************
 * @route /api/v1/make-videos/
 * @desc sanitize make-videos
 ***********************************/

exports.sanitizeMakeVideos = asyncHandler(async (makeVideos) => {
    return (
        makeVideos.map((makeVideo) => {
            return {
                id: makeVideo._id,
                level_points: makeVideo.user_id.score.level.points,
                user_id: makeVideo.user_id._id,
                email: makeVideo.user_id.email,
                url_video: makeVideo.url_video,
                screenshot: makeVideo.screenshot.url,
                status: {
                    color: makeVideo.status.color,
                    name: makeVideo.status.name,
                },
                done: makeVideo.done,
                createdAt: makeVideo.createdAt,
                updatedAt: makeVideo.updatedAt,
            };
        })
    );
});

exports.sanitizeMakeVideosInHistories = asyncHandler(async (makeVideos) => {
    return (
        makeVideos.map((makeVideo) => {
            return {
                url_video: makeVideo.url_video,
                screenshot: makeVideo.screenshot.url,
                status: {
                    color: makeVideo.status.color,
                    name: makeVideo.status.name,
                },
                voucher: makeVideo.voucher
            };
        })
    );
});

exports.sanitizeMakeVideo = asyncHandler(async (makeVideo) => {
    return {
        id: makeVideo._id,
        url_video: makeVideo.url_video,
        screenshot: makeVideo.screenshot.url,
        status: {
            color: makeVideo.status.color,
            name: makeVideo.status.name,
        },
        done: makeVideo.done,
        createdAt: makeVideo.createdAt,
        updatedAt: makeVideo.updatedAt,
    };
});

exports.sanitizeMakeVideoToUpdate = asyncHandler(async (makeVideo) => {
    return {
        id: makeVideo._id,
        level_points: makeVideo.user_id.score.level.points,
        user_id: makeVideo.user_id._id,
        email: makeVideo.user_id.email,
        url_video: makeVideo.url_video,
        screenshot: makeVideo.screenshot.url,
        status: {
            color: makeVideo.status.color,
            name: makeVideo.status.name,
        },
    };
});