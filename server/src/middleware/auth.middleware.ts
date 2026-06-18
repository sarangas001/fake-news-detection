import { verifyAccessToken } from "../shared/sercurity/jwt";

export const authMiddleware = (req: any, res: any, next: any) => {
    // Implementation for authentication middleware
    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token missing"
        });
    }
    const payload = verifyAccessToken( token );
    req.user = payload;
    next();
};