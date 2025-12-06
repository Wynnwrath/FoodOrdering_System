import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Adapter must include the database URL
const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.menu.createMany({
    data: [
      { name: "Classic Burger", price: 12.5, category: "Burgers" },
      { name: "Pepperoni Pizza", price: 13.9, category: "Pizza" },
      { name: "Caesar Salad", price: 9.75, category: "Salads" },
      { name: "Coke", price: 3.0, category: "Drinks" },
      { name: "Cheese Burger", price: 11.5, category: "Burgers" },
      { name: "Veggie Pizza", price: 12.0, category: "Pizza" },
    ],
  });

  console.log("🌱 Seeded menu!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
