import { PrismaClient, Role, Plan } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password: string) {
  // Simple demo hash (NOT for production). Replace with bcrypt/argon2 in real apps.
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  const demoEmail = process.env.DEMO_ADMIN_EMAIL ?? "admin@demo.local";
  const demoPassword = process.env.DEMO_ADMIN_PASSWORD ?? "Admin123!";

  const company = await prisma.company.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Company",
      slug: "demo",
      plan: Plan.PRO,
      isActive: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Demo Admin",
      passwordHash: hashPassword(demoPassword),
    },
  });

  await prisma.membership.upsert({
    where: { userId_companyId: { userId: user.id, companyId: company.id } },
    update: { role: Role.OWNER },
    create: {
      userId: user.id,
      companyId: company.id,
      role: Role.OWNER,
    },
  });

  console.log("Seeded demo admin:");
  console.log({ email: demoEmail, password: demoPassword });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


