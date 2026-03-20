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
    // ✅ NON BLOCKING DB
    (0, database_1.initDatabase)().catch(console.error);
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
startServer();
//# sourceMappingURL=server.js.map