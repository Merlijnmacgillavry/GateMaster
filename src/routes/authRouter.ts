import express from "express";
import jwt from 'jsonwebtoken';
import { getEnv } from "../env";
import { User } from "../Models";
import { getDb } from "../mongoDb";
import { getSM } from "../serviceManager";

export const router = express.Router({ mergeParams: true });

router.post('/register/:serviceName', async (req, res) => {
    const db = getDb()
    const env = getEnv()
    let jwtSecret = env.jwtSecret;

    const serviceName = req.params.serviceName;
    let roles = [serviceName]

    const { email, password } = req.body;

    const newUser: User = {
        email, password, roles
    }
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
router.post('/login/:serviceName', async (req, res) => {
    const db = getDb();
    const env = getEnv()
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
    const accessToken = jwt.sign({
        email: user.email, roles: user.roles
    }, jwtSecret, { expiresIn: '1m' });
    const refreshToken = jwt.sign({ email: user.email, roles: user.roles }, jwtSecret, { expiresIn: '7d' });
    const id = user._id;
    // Return access token and refresh token
    return res.json({ id, accessToken, refreshToken });
});

// Route for refreshing access token
router.post('/refresh-token/:serviceName', async (req, res) => {
    const jwtSecret = getEnv().jwtSecret;
    const db = getDb();

    const serviceName = req.params.serviceName;
    const service = getSM().findByName(serviceName)


    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token not provided.' });
    }
    const usersCollection = db.collection('users');




    try {
        // Verify and decode refresh token
        const decoded = jwt.verify(refreshToken, jwtSecret) as { email: string, roles: string[] };
        const user = await usersCollection.findOne({ email: decoded.email });

        // Generate new access token
        const accessToken = jwt.sign({
            email: decoded.email, roles: decoded.roles
        }, jwtSecret, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ email: decoded.email, roles: decoded.roles }, jwtSecret, { expiresIn: '7d' });
        const id = user?._id;
        // Return new access token
        return res.json({ id, accessToken, refreshToken: newRefreshToken });
    } catch (err) {
        return res.status(403).json({ error: 'Invalid refresh token.' });
    }
});