import type { Request, Response } from "express";
import * as jobsService from "./jobs.service.js";

export async function createJob(
    req: Request & {userId?: string},
    res: Response
) {
    const userId = req.userId!;
    const job = await jobsService.createJob(userId, req.body);
    res.status(201).json(job);
}


export async function listJobs(
  req: Request & { userId?: string },
  res: Response
) {
  const jobs = await jobsService.getJobs(req.userId!);
  res.json({ jobs });
}

export async function updateJob(
  req: Request & { userId?: string },
  res: Response
) {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("id is required");
  }
    const job = await jobsService.updateJob(req.userId!, id, req.body);
    res.json(job);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}
