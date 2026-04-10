const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cat = await prisma.category.upsert({
    where: { name: 'Sports' },
    update: {},
    create: { name: 'Sports' },
  });

  const existing = await prisma.product.findFirst({
    where: { name: 'Yoga Mat', categoryId: cat.id }
  });

  if (!existing) {
    await prisma.product.create({
      data: {
        name: 'Yoga Mat',
        description: 'Premium non-slip yoga mat for all your exercises.',
        price: 25.99,
        stock: 100,
        categoryId: cat.id,
        images: {
          create: [{ url: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80' }]
        }
      }
    });
    console.log('Added Sports category and product');
  } else {
    console.log('Sports product already exists');
  }
}

main().finally(() => prisma.$disconnect());
