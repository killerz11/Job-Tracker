import app from "./app.js";
import healthRoute from "./routes/health.js";

const PORT = process.env.PORT || 4000;

app.use("/api", healthRoute);

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
