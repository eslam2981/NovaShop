const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update existing products with real images
  const products = await prisma.product.findMany({ include: { images: true } });
  
  const placeholders = [
    'https://placehold.co/600x400?text=Product',
    'https://via.placeholder.com/600x400'
  ];

  let imagesMap = {
    'Wireless Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'Cotton T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'Desk Lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
  };

  for (const product of products) {
    let needsImage = product.images.length === 0 || product.images.some(img => placeholders.includes(img.url) || img.url.includes('placehold.co'));
    
    if (needsImage) {
      if (product.images.length > 0) {
        // Delete placeholder images
        await prisma.productImage.deleteMany({
          where: { productId: product.id }
        });
      }

      const imageUrl = imagesMap[product.name] || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&sig=${Math.random()}`;

      await prisma.productImage.create({
        data: {
          url: imageUrl,
          productId: product.id
        }
      });
      console.log(`Updated image for product: ${product.name}`);
    }
  }

  // Create new products
  const categories = await prisma.category.findMany();
  if (categories.length === 0) return;

  const newProducts = [
    {
      name: 'Smart Watch Series 7',
      description: 'Advanced health tracking and notification features on your wrist.',
      price: 299.99,
      stock: 45,
      cat: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80'
    },
    {
      name: 'Mechanical Gaming Keyboard',
      description: 'RGB mechanical keyboard with tactile switches for the ultimate gaming experience.',
      price: 129.50,
      stock: 80,
      cat: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'
    },
    {
      name: 'Denim Jacket',
      description: 'Classic denim jacket with a comfortable fit and vintage wash.',
      price: 89.99,
      stock: 150,
      cat: 'Clothing',
      imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80'
    },
    {
      name: 'Minimalist Wall Clock',
      description: 'Silent movement wooden wall clock with a modern minimalist design.',
      price: 34.00,
      stock: 60,
      cat: 'Home',
      imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80'
    },
    {
      name: 'Bluetooth Speaker',
      description: 'Portable waterproof bluetooth speaker with 24-hour battery life.',
      price: 59.99,
      stock: 200,
      cat: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80'
    }
  ];

  for (const p of newProducts) {
    const cat = categories.find((c) => c.name === p.cat);
    if (!cat) continue;

    const existing = await prisma.product.findFirst({
      where: { name: p.name }
    });
    
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          categoryId: cat.id,
          images: {
            create: [{ url: p.imageUrl }]
          }
        }
      });
      console.log(`Created new product: ${p.name}`);
    }
  }

  console.log('Done mapping product images and adding new products.');
}

main().finally(() => prisma.$disconnect());
