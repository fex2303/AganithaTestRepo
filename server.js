import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import chokidar from "chokidar";
import { WebSocketServer } from "ws";

import RoutesConfig from "./routes/index.js";
import BootstrapApp from "./system/bootstrap.js";

dotenv.config();

const app = express();
new BootstrapApp(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware FIRST
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static files
app.use("/public", express.static(path.join(__dirname, "public")));

// ✅ Routes
RoutesConfig(app);

// ✅ Error handler LAST
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Unable to process request" });
});

// ✅ Start server FIRST
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// ✅ WebSocket AFTER server is created
const wss = new WebSocketServer({ server });

// ✅ Watch public folder & notify clients
chokidar.watch("./public").on("change", () => {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send("reload");
    }
  });
});
