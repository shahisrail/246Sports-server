import dotenv from 'dotenv';
import app from './app';
import { initDatabase } from './config/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initDatabase();

    // Start listening
    app.listen(PORT, () => {
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
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// Start the server
startServer();
