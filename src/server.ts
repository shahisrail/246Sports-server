import dotenv from "dotenv";

console.log("🚀 ENTRY FILE LOADED");

import app from "./app";
import { initDatabase } from "./config/database";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  console.log("🔥 SERVER STARTING...");

  try {
    await initDatabase();
  } catch (err) {
    console.error("DB ERROR:", err);
  }

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

process.on("exit", (code) => {
  console.log("❌ PROCESS EXITED:", code);
});

try {
  startServer();
} catch (err) {
  console.error("🔥 FATAL ERROR:", err);
}