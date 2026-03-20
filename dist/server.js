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
    console.log("PORT:", PORT);
    let dbConnected = false;
    try {
        await (0, database_1.initDatabase)();
        dbConnected = true;
    }
    catch (error) {
        console.error("❌ DB failed:", error?.message || error);
    }
    // ✅ MUST for Coolify
    app_1.default.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};
// ❌ prevent crash
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});
startServer();
//# sourceMappingURL=server.js.map