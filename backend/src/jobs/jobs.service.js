import { prisma } from "../lib/prisma.js";
export async function createJob(userId, data) {
    const platformEnum = data.platform.toUpperCase();
    return prisma.job.upsert({
        where: {
            userId_jobUrl: {
                userId,
                jobUrl: data.jobUrl
            },
        },
        update: {
            updatedAt: new Date(),
        },
        create: {
            companyName: data.companyName,
            jobTitle: data.jobTitle,
            location: data.location ?? null,
            description: data.description ?? null,
            jobUrl: data.jobUrl,
            platform: platformEnum,
            appliedAt: new Date(data.appliedAt),
            userId,
        },
    });
}
export async function getJobs(userId) {
    return prisma.job.findMany({
        where: { userId },
        orderBy: { appliedAt: "desc" },
    });
}
export async function updateJob(userId, jobId, data) {
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
            status: data.status,
            updatedAt: new Date(),
        },
    });
}
//# sourceMappingURL=jobs.service.js.map