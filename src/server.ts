import dotenv from "dotenv";
import app from "./app";
import { initDatabase } from "./config/database";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4000", 10);

const startServer = async () => {
  console.log("🔥 SERVER STARTING...");
  console.log("PORT:", PORT);

  let dbConnected = false;

  try {
    await initDatabase();
    dbConnected = true;
    console.log("✅ Database connected successfully");
  } catch (error: any) {
    console.error("❌ Database connection failed:", error?.message || error);
    console.log("⚠️ Starting server WITHOUT database...");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
🚀 Server is running!

📌 Port: ${PORT}
🌍 Env: ${process.env.NODE_ENV}
🗄️ DB: ${dbConnected ? "CONNECTED ✅" : "NOT CONNECTED ❌"}

🔗 Health: http://localhost:${PORT}/health
    `);
  });
};

process.on("unhandledRejection", (err: any) => {
  console.error("⚠️ Unhandled Promise Rejection:", err?.message || err);
});

process.on("uncaughtException", (err: any) => {
  console.error("⚠️ Uncaught Exception:", err?.message || err);
});

startServer();