import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client.ts";

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const user = await prisma.user.findUnique({ where: { email: "sadmanjahen90@gmail.com" } });
console.log("User:", JSON.stringify(user, null, 2));

const incomes = await prisma.income.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
console.log("\nIncomes:", JSON.stringify(incomes, null, 2));

const expenses = await prisma.expense.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
console.log("\nExpenses:", JSON.stringify(expenses, null, 2));

await prisma.$disconnect();
