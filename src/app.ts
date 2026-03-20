import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";

const app: Application = express();

// ✅ basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// ✅ debug log (important)
app.use((req, _res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

// ✅ health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running 🚀",
  });
});

// ✅ root route
app.get("/", (_req, res) => {
  res.send("API running 🚀");
});

export default app;