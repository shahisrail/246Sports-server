"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 4000;
const startServer = async () => {
    console.log("🔥 SERVER STARTING...");
    console.log("ENV:", process.env.NODE_ENV);
    console.log("PORT:", PORT);
    let dbConnected = false;
    try {
        await (0, database_1.initDatabase)();
        dbConnected = true;
        console.log("✅ Database connected successfully");
    }
    catch (error) {
        console.error("❌ Database connection failed:", error?.message || error);
        console.log("⚠️ Starting server WITHOUT database...");
    }
    app_1.default.listen(PORT, "0.0.0.0", () => {
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
// Safety handlers (DO NOT crash container)
process.on("unhandledRejection", (err) => {
    console.error("⚠️ Unhandled Promise Rejection:", err?.message || err);
});
process.on("uncaughtException", (err) => {
    console.error("⚠️ Uncaught Exception:", err?.message || err);
});
startServer();
//# sourceMappingURL=server.js.map