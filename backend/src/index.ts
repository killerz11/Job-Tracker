import "dotenv/config";
import app from "./app.js";
import healthRoute from "./routes/health.js";
import authRoutes from "./auth/auth.routes.js";
import jobsRoutes from "./jobs/jobs.routes.js";

const PORT = process.env.PORT || 4000;

// Register routes BEFORE starting server
app.use("/api", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});

