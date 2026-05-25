import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

let prisma;

// Resolve absolute path to SQLite file at the project root
const dbPath = path.resolve(process.cwd(), "dev.db");
const connectionUrl = `file:${dbPath}`;

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
