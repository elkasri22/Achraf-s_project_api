const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Match = require("../Models/matches.model");
const WebSockets = require("../socket/socket");

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

/**
 * @desc GET ALL MATCHES
 * @route /api/v1/matches
 * @method GET
 * @access public
 */
exports.getAll = asyncHandler(async (req, res, next) => {
    let { page, limit } = req.query;

    if (!page) page = "";
    if (!limit) limit = "";

    const offset = (page - 1) * limit;

    // i want get the first matches is has isFirst = true

    let data = await Match.find().sort({ isFirst: -1, createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .select("-createdAt -updatedAt -__v");

    let countDocuments = await Match.find().sort({ isFirst: -1, createdAt: -1 }).countDocuments();

    const result = data.length;

    const numberOfPages = Math.ceil(countDocuments / limit);

    const pageNow = Number(page) || 1;

    const pagination = {
        page: pageNow,
        numberOfPages,
    };

    res.status(200).json({
        status: "success",
        result,
        pagination,
        data,
    });
});

/**
 * @desc CREATE MATCH
 * @route /api/v1/matches
 * @method POST
 * @access private
 */
exports.create = asyncHandler(async (req, res, next) => {

    const transformedData = {
        status: req.body.status,
        type: req.body.type,
        league: {
            name: req.body.league_name,
            logo: req.body.league_logo
        },
        homeTeam: {
            name: req.body.homeTeam_name,
            logo: req.body.homeTeam_logo,
            score: req.body.homeTeam_score || 0
        },
        awayTeam: {
            name: req.body.awayTeam_name,
            logo: req.body.awayTeam_logo,
            score: req.body.awayTeam_score || 0
        },
        date: req.body.date,
        time: req.body.time,
        end_time: req.body.end_time,
        type_match: req.body.type_match,
        isFirst: req.body.isFirst || false,
        matchUrl: req.body.matchUrl
    };

    const match = await new Match(transformedData).save();

    delete match._doc.createdAt;
    delete match._doc.__v;

    const matches = await GetAllMatches();

    await WebSockets.sendMatches(matches);

    res.status(201).json({ status: "success", message: "Match created successfully" });
});

/**
 * @desc UPDATE MATCHES
 * @route /api/v1/matches/:id
 * @method PUT
 * @access private
 */
exports.update = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // validation req.body is not empty

    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Please provide fields to update"));
    };

    
    const match = await Match.findById(id);
    
    if (!match) {
        return next(new ApiError(404, "Match does not exist!!"));
    };
    
    let transformedData = {
        league: {
            name: match.league.name,
            logo: match.league.logo
        },
        homeTeam: {
            name: match.homeTeam.name,
            logo: match.homeTeam.logo,
            score: match.homeTeam.score
        },
        awayTeam: {
            name: match.awayTeam.name,
            logo: match.awayTeam.logo,
            score: match.awayTeam.score
        }
    };
    
    
    if(req.body?.status) transformedData.status = req.body.status;
    if(req.body?.type) transformedData.type = req.body.type;
    if(req.body?.league_name) transformedData.league.name = req.body.league_name;
    if(req.body?.league_logo) transformedData.league.logo = req.body.league_logo;
    if(req.body?.homeTeam_name) transformedData.homeTeam.name = req.body.homeTeam_name;
    if(req.body?.homeTeam_logo) transformedData.homeTeam.logo = req.body.homeTeam_logo;
    if(req.body?.homeTeam_score) transformedData.homeTeam.score = req.body.homeTeam_score;
    if(req.body?.awayTeam_name) transformedData.awayTeam.name = req.body.awayTeam_name;
    if(req.body?.awayTeam_logo) transformedData.awayTeam.logo = req.body.awayTeam_logo;
    if(req.body?.awayTeam_score) transformedData.awayTeam.score = req.body.awayTeam_score;
    if(req.body?.date) transformedData.date = req.body.date;
    if(req.body?.time) transformedData.time = req.body.time;
    if(req.body?.end_time) transformedData.end_time = req.body.end_time;
    if(req.body?.type_match) transformedData.type_match = req.body.type_match;
    if(req.body?.isFirst) transformedData.isFirst = req.body.isFirst;
    if(req.body?.matchUrl) transformedData.matchUrl = req.body.matchUrl;

    const data = await Match.findOneAndUpdate({ _id: id }, transformedData, {
        new: true,
        runValidators: true
    });

    delete data._doc.createdAt;
    delete data._doc.__v;

    const matches = await GetAllMatches();

    await WebSockets.sendMatches(matches);

    res.status(200).json({
        status: "success",
        message: "Match updated successfully",
    });
});

/**
 * @desc GET A MATCH
 * @route /api/v1/matches/:id
 * @method GET
 * @access private
 */

exports.getOne = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const match = await Match.findById(id);

    if (!match) {
        return next(new ApiError(404, "Match does not exist!!"));
    };

    delete match._doc.createdAt;
    delete match._doc.__v;

    res.status(200).json({
        status: "success",
        data: match
    });
});

/**
 * @desc DELETE A MATCH
 * @route /api/v1/matches/:id
 * @method DELETE
 * @access private
 */

exports.delete = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const match = await Match.findById(id);

    if (!match) {
        return next(new ApiError(404, "Match does not exist!!"));
    };

    await Match.findOneAndDelete({ _id: id });

    const matches = await GetAllMatches();

    await WebSockets.sendMatches(matches);

    res.status(200).json({
        status: "success",
        message: "Match deleted successfully",
    });
});