import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const planCountBefore = await prisma.planSPK.count();
  const userCount = await prisma.user.count();

  console.log(`Starting mock data cleanup.`);
  console.log(`Existing plan records: ${planCountBefore}`);
  console.log(`Total users in database: ${userCount} (will remain untouched)`);

  const deleteResult = await prisma.planSPK.deleteMany({});
  console.log(`Deleted ${deleteResult.count} plan SPK records.`);

  const planCountAfter = await prisma.planSPK.count();
  const userCountAfter = await prisma.user.count();

  console.log(`Verification:`);
  console.log(`- Remaining plan records: ${planCountAfter}`);
  console.log(`- Remaining users: ${userCountAfter}`);
}

main()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
