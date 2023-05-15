"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
// Middleware for checking authorization based on user roles
const authorize = (roles) => (req, res, next) => {
    const { user } = req;
    if (!user) {
        return res.status(403).json({ error: 'Authorization failed. User not authenticated.' });
    }
    // Check if user has any of the required roles
    const hasRole = user.roles.some((role) => roles.includes(role));
    if (!hasRole) {
        return res.status(403).json({ error: 'Authorization failed. User does not have the required roles.' });
    }
    console.log(req);
    // User is authorized, proceed to next middleware or route handler
    next();
};
exports.authorize = authorize;
