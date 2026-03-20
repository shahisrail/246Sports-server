import dotenv from "dotenv";
import app from "./app";
import { initDatabase } from "./config/database";

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  let dbConnected = false;

  try {
    await initDatabase();
    dbConnected = true;
    console.log("✅ Database connected successfully");
  } catch (error: any) {
    console.error("❌ Database connection failed:", error?.message || error);
    console.log("⚠️ Starting server WITHOUT database...");
  }

  app.listen(PORT, () => {
    console.log(`
🚀 Server is running!

📌 Port: ${PORT}
🌍 Env: ${process.env.NODE_ENV}
🗄️ DB: ${dbConnected ? "CONNECTED ✅" : "NOT CONNECTED ❌"}

🔗 Health: http://localhost:${PORT}/health
🔗 Docs: http://localhost:${PORT}/api-docs
    `);
  });
};

// Safety handlers (DON'T exit container)
process.on("unhandledRejection", (err: any) => {
  console.error("⚠️ Unhandled Promise Rejection:", err?.message || err);
});

process.on("uncaughtException", (err: any) => {
  console.error("⚠️ Uncaught Exception:", err?.message || err);
});

startServer();
