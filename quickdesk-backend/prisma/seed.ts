import { PrismaClient, Role } from "../generated/prisma";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: {
      email: "agent@quickdesk.com",
    },
    update: {},
    create: {
      name: "Support Agent",
      email: "agent@quickdesk.com",
      password: hashedPassword,
      role: Role.AGENT,
    },
  });

  console.log("✅ Agent seeded");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });