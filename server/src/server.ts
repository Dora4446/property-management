import app from './app';
import { connectDB, disconnectDB } from './config/db';
import { ENV } from './config/env';
import { User } from './models/User';
import { seedDatabase } from './seed/seed';

const startServer = async () => {
  try {
    await connectDB();

    // Check if database needs initial seeding
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] Database is empty. Seeding initial demo accounts and properties...');
      await seedDatabase();
    }

    const PORT = parseInt(ENV.PORT, 10) || 5000;
    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 PropertyHub API Server running in ${ENV.NODE_ENV} mode`);
      console.log(`📍 Endpoint: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDB();
        console.log('Server and database connections terminated cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
