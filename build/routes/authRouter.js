"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../env");
const mongoDbService_1 = require("../mongoDbService");
const serviceManager_1 = require("../serviceManager");
exports.router = express_1.default.Router({ mergeParams: true });
exports.router.post('/register/:serviceName', async (req, res) => {
    const db = (0, mongoDbService_1.getDb)();
    const env = (0, env_1.getEnv)();
    let jwtSecret = env.jwtSecret;
    const serviceName = req.params.serviceName;
    let roles = [serviceName];
    const { email, password } = req.body;
    const newUser = {
        email, password, roles
    };
    // Open ocnnection
    const usersCollection = db.collection('users');
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: 'Registration failed. User already exists.' });
    }
    // Insert new user in MongoDB
    let user = await usersCollection.insertOne(newUser);
    // Registration successful
    return res.status(201).json({ message: 'Registration successful.', user });
});
// Route for logging in and getting access token and refresh token
exports.router.post('/login/:serviceName', async (req, res) => {
    const db = (0, mongoDbService_1.getDb)();
    const env = (0, env_1.getEnv)();
    let jwtSecret = env.jwtSecret;
    const { email, password } = req.body;
    const usersCollection = db.collection('users');
    // Find user in the MongoDB collection by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
        // User not found
        return res.status(401).json({ error: 'Authentication failed. User not found.' });
    }
    // Compare password hash
    if (password !== user.password) {
        // Passwords do not match
        return res.status(401).json({ error: 'Authentication failed. Invalid password.' });
    }
    // Authentication successful, generate JWT access token and refresh token
    const accessToken = jsonwebtoken_1.default.sign({
        email: user.email, roles: user.roles
    }, jwtSecret, { expiresIn: '1m' });
    const refreshToken = jsonwebtoken_1.default.sign({ email: user.email, roles: user.roles }, jwtSecret, { expiresIn: '7d' });
    const id = user._id;
    // Return access token and refresh token
    return res.json({ id, accessToken, refreshToken });
});
// Route for refreshing access token
exports.router.post('/refresh-token/:serviceName', async (req, res) => {
    const jwtSecret = (0, env_1.getEnv)().jwtSecret;
    const db = (0, mongoDbService_1.getDb)();
    const serviceName = req.params.serviceName;
    const service = (0, serviceManager_1.getSM)().findByName(serviceName);
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token not provided.' });
    }
    const usersCollection = db.collection('users');
    try {
        // Verify and decode refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, jwtSecret);
        const user = await usersCollection.findOne({ email: decoded.email });
        // Generate new access token
        const accessToken = jsonwebtoken_1.default.sign({
            email: decoded.email, roles: decoded.roles
        }, jwtSecret, { expiresIn: '15m' });
        const newRefreshToken = jsonwebtoken_1.default.sign({ email: decoded.email, roles: decoded.roles }, jwtSecret, { expiresIn: '7d' });
        const id = user?._id;
        // Return new access token
        return res.json({ id, accessToken, refreshToken: newRefreshToken });
    }
    catch (err) {
        return res.status(403).json({ error: 'Invalid refresh token.' });
    }
});
