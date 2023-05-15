import express, { Request, Response, NextFunction } from 'express';

// Middleware for checking authorization based on user roles
export const authorize = (roles: string[]) => (req: any, res: Response, next: NextFunction) => {
    const { user } = req;

    if (!user) {
        return res.status(403).json({ error: 'Authorization failed. User not authenticated.' });
    }

    // Check if user has any of the required roles
    const hasRole = user.roles.some((role: string) => roles.includes(role));
    if (!hasRole) {
        return res.status(403).json({ error: 'Authorization failed. User does not have the required roles.' });
    }
    console.log(req);
    // User is authorized, proceed to next middleware or route handler
    next();
};