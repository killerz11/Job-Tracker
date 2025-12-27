import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

interface TokenPayload extends JwtPayload {
    userId: string;
}

export function authenticate(
    req: Request & { userId?: string },
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ error: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
        req.userId = payload.userId;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
