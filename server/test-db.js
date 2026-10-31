require("dotenv").config();
const prisma = require("./src/config/prisma");

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Connection status: Successfully connected to Neon PostgreSQL!");

    const userCount = await prisma.user.count();
    const propertyCount = await prisma.property.count();

    console.log(`Users record count: ${userCount}`);
    console.log(`Properties record count: ${propertyCount}`);
  } catch (error) {
    const safeMsg = (error && error.message)
      ? error.message.replace(/:\/\/([^:]+):([^@]+)@/g, "://$1:****@")
      : "Unknown error occurred";
    console.error("Database connection failed:", safeMsg);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
