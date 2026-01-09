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


export async function getJobs(
    userId: string, 
    page: number = 1, 
    limit: number = 10,
    platform?: string,
    status?: string
) {
    const skip = (page - 1) * limit;

    // Build where clause with optional platform and status filters
    const whereClause: any = { userId };
    
    if (platform && platform !== 'ALL') {
        whereClause.platform = platform.toUpperCase();
    }

    if (status && status !== 'ALL') {
        whereClause.status = status.toUpperCase();
    }

    const total = await prisma.job.count({
        where: whereClause
    });

    const jobs = await prisma.job.findMany({
        skip: skip,
        take: limit,
        where: whereClause,
        orderBy: { appliedAt: "desc" },
    });

    const totalPages = Math.ceil(total / limit);

    return {
        jobs,
        total,
        page,
        totalPages,
        limit
    };
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