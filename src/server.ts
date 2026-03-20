import dotenv from "dotenv";
import app from "./app";
import { initDatabase } from "./config/database";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  console.log("🔥 SERVER STARTING...");
  console.log("PORT:", PORT);

  try {
    await initDatabase();
  } catch (error: any) {
    console.error("❌ DB failed:", error?.message || error);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

process.on("unhandledRejection", (err: any) => {
  console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err: any) => {
  console.error("Uncaught Exception:", err);
});

startServer();