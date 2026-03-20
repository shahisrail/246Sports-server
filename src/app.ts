import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import v1Routes from "./routes/v1.routes";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// debug log
app.use((req, _res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

// routes
app.use("/api/v1", v1Routes);

// health
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running 🚀",
  });
});

app.get("/", (_req, res) => {
  res.send("API running 🚀");
});

export default app;