import type { Request, Response } from "express";
export declare function createJob(req: Request & {
    userId?: string;
}, res: Response): Promise<void>;
export declare function listJobs(req: Request & {
    userId?: string;
}, res: Response): Promise<void>;
export declare function updateJob(req: Request & {
    userId?: string;
}, res: Response): Promise<void>;
//# sourceMappingURL=jobs.controller.d.ts.map