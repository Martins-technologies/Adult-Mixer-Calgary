import { app } from "./app";
import { env } from "./config/env";
import { connectDatabase, startDatabaseKeepAlive } from "./config/prisma";

const PORT = env.PORT;

async function startServer() {
  try {
    await connectDatabase();
    startDatabaseKeepAlive();
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    console.error(
      "   Neon databases sleep after inactivity. Open console.neon.tech to wake yours, then restart the server.",
    );
    process.exit(1);
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📦 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 Frontend URL: ${env.FRONTEND_URL || "Not set"}`);
    console.log(`✅ Server is ready to accept connections`);
  });
}

startServer();