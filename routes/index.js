import path from "path";
import { fileURLToPath } from "url";

import SampleController from "../controllers/sample.controller.js";
import AganithaPasteBinController from "../controllers/aganithaPasteBinController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function routes(app) {
  const sampleController = new SampleController();
  const aganithaPasteBinController = new AganithaPasteBinController();

  // ✅ Serve HTML from public folder
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/webpage.html"));
  });

  // Test route
  app.get("/test", sampleController.method);

  // API routes
  app.get("/api/healthz", aganithaPasteBinController.healthCheck);
  app.post("/api/pastes", aganithaPasteBinController.createPaste);
  app.get("/api/pastes/:pasteId", aganithaPasteBinController.fetchPaste);

  // HTML paste view
  app.get("/p/:pasteId", aganithaPasteBinController.viewPaste);
}
