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

export async function updateJob(
    userId: string,
    jobId: string,
    data: { status?: string }
) {
    // Verify the job belongs to the user
    const job = await prisma.job.findFirst({
        where: { id: jobId, userId },
    });

    if (!job) {
        throw new Error("Job not found");
    }

    return prisma.job.update({
        where: { id: jobId },
        data: {
            status: data.status as any,
            updatedAt: new Date(),
        },
    });
}