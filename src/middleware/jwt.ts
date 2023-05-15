import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../env';
import { getDb } from '../mongoDb';

// Middleware for verifying JWT access token
export const authenticateJWT = async (req: any, res: Response, next: NextFunction) => {
    console.log(req.method, req.baseUrl, req.headers['upgrade']);
    const jwtSecret = getEnv().jwtSecret
    const db = getDb();


    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Authentication failed. No access token provided.' });
    }
    let decoded;
    try {
        console.log(token)
        decoded = jwt.verify(token, jwtSecret) as { email: string, roles: string[] };
        // const exp = jwt.decode(token);
        console.log(decoded)
        const users = db.collection('users');
        let user = await users.findOne({ email: decoded.email })
        console.log(user)
        req.user = user;
        next()
    } catch (err) {
        return res.status(403).json({ error: 'Authentication failed. Invalid access token.' });
    }


};