export declare function createJob(userId: string, data: {
    companyName: string;
    jobTitle: string;
    location?: string;
    description?: string;
    jobUrl: string;
    platform: string;
    appliedAt: string;
}): Promise<{
    id: string;
    createdAt: Date;
    companyName: string;
    jobTitle: string;
    location: string | null;
    description: string | null;
    jobUrl: string;
    platform: import("@prisma/client").$Enums.JobPlatform;
    status: import("@prisma/client").$Enums.JobStatus;
    appliedAt: Date;
    userId: string;
    updatedAt: Date;
}>;
export declare function getJobs(userId: string): Promise<{
    id: string;
    createdAt: Date;
    companyName: string;
    jobTitle: string;
    location: string | null;
    description: string | null;
    jobUrl: string;
    platform: import("@prisma/client").$Enums.JobPlatform;
    status: import("@prisma/client").$Enums.JobStatus;
    appliedAt: Date;
    userId: string;
    updatedAt: Date;
}[]>;
export declare function updateJob(userId: string, jobId: string, data: {
    status?: string;
}): Promise<{
    id: string;
    createdAt: Date;
    companyName: string;
    jobTitle: string;
    location: string | null;
    description: string | null;
    jobUrl: string;
    platform: import("@prisma/client").$Enums.JobPlatform;
    status: import("@prisma/client").$Enums.JobStatus;
    appliedAt: Date;
    userId: string;
    updatedAt: Date;
}>;
//# sourceMappingURL=jobs.service.d.ts.map