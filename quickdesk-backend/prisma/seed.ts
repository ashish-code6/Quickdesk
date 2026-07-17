import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: {
      email: "agent@quickdesk.com",
    },
    update: {
      name: "Support Agent",
      password: hashedPassword,
      role: Role.AGENT,
    },
    create: {
      name: "Support Agent",
      email: "agent@quickdesk.com",
      password: hashedPassword,
      role: Role.AGENT,
    },
  });

  console.log("✅ Agent account seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });