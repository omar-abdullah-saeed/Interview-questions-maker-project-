import "dotenv/config";
import cors from "cors";
import express from "express";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { connectDatabase } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import quizRoutes from "./routes/quizzes.js";
import { authenticate } from "./utils/auth.js";


const app = express();
const port = Number(process.env.PORT) || 8080;
const frontendDistPath = resolve(dirname(fileURLToPath(import.meta.url)), "../frontend/dist");


app.use(cors());
app.use(express.json({ limit: "1mb" }));


app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", authenticate, quizRoutes);
app.use(express.static(frontendDistPath));
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
  res.sendFile(resolve(frontendDistPath, "index.html"), (error) => {
    if (error) next(error);
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

const start = async () => {
  await connectDatabase();
  app.listen(port, () => console.log(`Server is listening on port ${port}`));
};

start().catch((error) => {
  console.error("Unable to start server:", error.message);
  process.exitCode = 1;
});

export default app;





