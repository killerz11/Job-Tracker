import { Router } from "express";
import * as controller from "./jobs.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
const router = Router();
router.post("/", authenticate, controller.createJob);
router.get("/", authenticate, controller.listJobs);
router.patch("/:id", authenticate, controller.updateJob);
export default router;
//# sourceMappingURL=jobs.routes.js.map