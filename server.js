require("dotenv").config();
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { apiLimiter, requireApiToken } = require("./src/services/security");
const { errorHandler } = require("./src/services/errorHandler");
const { initDatabase } = require("./src/memory/database");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

initDatabase();

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(",").map(s => s.trim())
    : true
}));
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiLimiter);
app.use("/api", requireApiToken);

app.use("/api/chat", require("./src/routes/chatRoutes"));
app.use("/api/voice", require("./src/routes/voiceRoutes"));
app.use("/api/commands", require("./src/routes/commandRoutes"));
app.use("/api/status", require("./src/routes/statusRoutes"));
app.use("/api/memory", require("./src/routes/memoryRoutes"));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "JARVIS", timestamp: new Date().toISOString() }));
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.use(errorHandler);

app.listen(PORT, HOST, () => {
  console.log(`JARVIS listening on http://${HOST}:${PORT}`);
});
