import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./backend/prisma/dev.db",
});

export const prisma = new PrismaClient({ adapter });

prisma.$connect()
  .then(() => console.log("Prisma connected to SQLite"))
  .catch((err) => console.error("Prisma connection failed:", err));
