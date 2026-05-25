import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Use DATABASE_URL from .env, or fall back to relative path.
// This also works on Render where DATABASE_URL is set as an env var.
const connectionUrl = process.env.DATABASE_URL || "file:./dev.db";

let prisma;

if (process.env.NODE_ENV === "production") {
  const adapter = new PrismaBetterSqlite3({ url: connectionUrl });
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.prisma) {
    const adapter = new PrismaBetterSqlite3({ url: connectionUrl });
    global.prisma = new PrismaClient({ adapter });
  }
  prisma = global.prisma;
}

export default prisma;
