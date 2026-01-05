import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import RoutesConfig from "./routes/index.js";
import BootstrapApp from "./system/bootstrap.js";
import helmet from "helmet";
import cors from "cors";

dotenv.config();

const app = express();

new BootstrapApp(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(helmet());

app.use(cors());
app.use((err, req, res, next) => {
    console.error("Global Error:", err.message);
    res.status(500).json({ error: "Unable to process request" });
});

// routes
RoutesConfig(app);

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
