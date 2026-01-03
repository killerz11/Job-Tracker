import * as jobsService from "./jobs.service.js";
export async function createJob(req, res) {
    const userId = req.userId;
    const job = await jobsService.createJob(userId, req.body);
    res.status(201).json(job);
}
export async function listJobs(req, res) {
    const jobs = await jobsService.getJobs(req.userId);
    res.json({ jobs });
}
export async function updateJob(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            throw new Error("id is required");
        }
        const job = await jobsService.updateJob(req.userId, id, req.body);
        res.json(job);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
}
//# sourceMappingURL=jobs.controller.js.map