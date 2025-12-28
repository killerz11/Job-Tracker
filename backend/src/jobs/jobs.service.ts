import { prisma } from "../lib/prisma.js";

export async function createJob(
    userId: string,
    data: {
    companyName: string;
    jobTitle: string;
    location?: string;
    description?: string;
    jobUrl: string;
    platform: string;
    appliedAt: string;
    }
) {
    const platformEnum = data.platform.toUpperCase();

    return prisma.job.upsert({
        where:{
            userId_jobUrl: {
                userId,
                jobUrl: data.jobUrl
            },
        },
        update: {
            updatedAt: new Date(),
        },
        create:{
            companyName: data.companyName,
            jobTitle: data.jobTitle,
            location: data.location ?? null,
            description: data.description ?? null,
            jobUrl: data.jobUrl,
            platform: platformEnum as any,
            appliedAt: new Date(data.appliedAt),
            userId,
        },
    });
}

export async function getJobs(userId: string) {
    return prisma.job.findMany({
        where: {userId},
        orderBy: {appliedAt: "desc"},
    });
    
}