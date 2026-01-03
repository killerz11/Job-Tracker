import type { Request, Response } from "express";
import * as authService from "./auth.service.js";

export async function register(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email and password are required" });
        }

        const token = await authService.register(email, password);
        res.json({ token });
    } catch (error: any) {
        console.error("Register error:", error);
        res.status(500).json({ error: error.message || "Registration failed" });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email and password are required" });
        }

        const token = await authService.login(email, password);
        res.json({ token });
    } catch (error: any) {
        console.error("Login error:", error);
        res.status(401).json({ error: error.message || "Login failed" });
    }
}

export async function me(req: Request & { userId?: string }, res: Response) {
    res.json({ userId: req.userId });
}
