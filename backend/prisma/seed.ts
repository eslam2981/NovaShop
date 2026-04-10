import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Demo User',
      password: passwordHash,
      role: 'USER',
    },
  });

  const catNames = ['Electronics', 'Clothing', 'Home'];
  const categories: { id: string; name: string }[] = [];
  for (const name of catNames) {
    const c = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories.push(c);
  }

  const sample = [
    { name: 'Wireless Headphones', price: 79.99, stock: 50, cat: 'Electronics' },
    { name: 'Cotton T-Shirt', price: 24.99, stock: 120, cat: 'Clothing' },
    { name: 'Desk Lamp', price: 45.0, stock: 30, cat: 'Home' },
  ];

  for (const p of sample) {
    const cat = categories.find((c) => c.name === p.cat);
    if (!cat) continue;

    const existing = await prisma.product.findFirst({
      where: { name: p.name, categoryId: cat.id },
    });
    if (existing) continue;

    await prisma.product.create({
      data: {
        name: p.name,
        description: `${p.name} — sample product for development.`,
        price: p.price,
        stock: p.stock,
        categoryId: cat.id,
        images: {
          create: [{ url: 'https://placehold.co/600x400?text=Product' }],
        },
      },
    });
  }

  const now = new Date();
  const end = new Date();
  end.setFullYear(end.getFullYear() + 1);

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      startDate: now,
      endDate: end,
      isActive: true,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
