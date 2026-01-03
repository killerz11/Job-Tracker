import type { Request, Response, NextFunction } from "express";
export declare function authenticate(req: Request & {
    userId?: string;
}, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map