"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../env");
const mongoDbService_1 = require("../mongoDbService");
// Middleware for verifying JWT access token
const authenticateJWT = async (req, res, next) => {
    // console.log(req.method, req.baseUrl, req.headers['upgrade']);
    const jwtSecret = (0, env_1.getEnv)().jwtSecret;
    const db = (0, mongoDbService_1.getDb)();
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'Authentication failed. No access token provided.' });
    }
    let decoded;
    try {
        console.log(token);
        decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // const exp = jwt.decode(token);
        console.log(decoded);
        const users = db.collection('users');
        let user = await users.findOne({ email: decoded.email });
        console.log(user);
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(403).json({ error: 'Authentication failed. Invalid access token.' });
    }
};
exports.authenticateJWT = authenticateJWT;
