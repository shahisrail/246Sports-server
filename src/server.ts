import dotenv from "dotenv";
import app from "./app";
import { initDatabase } from "./config/database";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  console.log("🔥 SERVER STARTING...");

  // ✅ NON BLOCKING DB
  initDatabase().catch(console.error);

  app.listen(PORT, "0.0.0.0", () => {
    console.log("✅ SERVER RUNNING ON", PORT);
  });
};

process.on("unhandledRejection", (err: any) => {
  console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err: any) => {
  console.error("Uncaught Exception:", err);
});

startServer();