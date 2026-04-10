const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const prods = await prisma.product.findMany({include: {images: true}});
  console.log(JSON.stringify(prods, null, 2));
}
main().finally(() => prisma.$disconnect());
