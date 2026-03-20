"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
console.log("🚀 ENTRY FILE LOADED");
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 4000;
const startServer = async () => {
    console.log("🔥 SERVER STARTING...");
    try {
        await (0, database_1.initDatabase)();
    }
    catch (err) {
        console.error("DB ERROR:", err);
    }
    app_1.default.listen(PORT, "0.0.0.0", () => {
        console.log("✅ SERVER RUNNING ON", PORT);
    });
};
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});
process.on("exit", (code) => {
    console.log("❌ PROCESS EXITED:", code);
});
try {
    startServer();
}
catch (err) {
    console.error("🔥 FATAL ERROR:", err);
}
//# sourceMappingURL=server.js.map