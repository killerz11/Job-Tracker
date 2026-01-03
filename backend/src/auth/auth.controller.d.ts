import type { Request, Response } from "express";
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function me(req: Request & {
    userId?: string;
}, res: Response): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map