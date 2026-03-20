"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
// Load environment variables
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
// Start server
const startServer = async () => {
    try {
        // Initialize database connection
        await (0, database_1.initDatabase)();
        // Start listening
        app_1.default.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           🏆 246Sports API Server 🏆                      ║
║                                                            ║
║           Version: 2.0.0                                  ║
║           Environment: ${process.env.NODE_ENV || 'development'}                              ║
║           Port: ${PORT}                                          ║
║                                                            ║
║           API Docs: http://localhost:${PORT}/api-docs            ║
║           Health: http://localhost:${PORT}/health                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err.message);
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
});
// Start the server
startServer();
//# sourceMappingURL=server.js.map