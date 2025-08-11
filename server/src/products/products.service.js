import { prisma } from '../db/postgres.js';

// helper to normalize Prisma Decimal -> number
const serialize = (p) => p && ({
  ...p,
  pricePerDay: p.pricePerDay ? Number(p.pricePerDay) : 0
});

export const ProductsService = {
  async create(data) {
    const stock = Number.isFinite(data.stock) ? Math.max(0, data.stock) : 0;
    const doc = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? '',
        images: Array.isArray(data.images) ? data.images.filter(Boolean) : [],
        isRentable: Boolean(data.isRentable ?? true),
        stock: stock,
        availableStock: stock, // Initially all stock is available
        pricePerDay: data.pricePerDay,
        category: data.category ?? '',
        brand: data.brand ?? '',
        model: data.model ?? '',
        condition: data.condition ?? 'Good'
      }
    });
    return serialize(doc);
  },

  async list({ page = 1, limit = 20, search = '', rentable } = {}) {
    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (typeof rentable === 'boolean') where.isRentable = rentable;

    const skip = (Math.max(1, +page) - 1) * Math.max(1, +limit);

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Math.max(1, +limit)
      }),
      prisma.product.count({ where })
    ]);

    return {
      items: items.map(serialize),
      total,
      page: +page,
      limit: +limit
    };
  },

  async getById(id) {
    const p = await prisma.product.findUnique({ where: { id } });
    return serialize(p);
  },

  async update(id, data) {
    const update = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;
    if (data.images !== undefined) update.images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
    if (data.isRentable !== undefined) update.isRentable = !!data.isRentable;
    if (data.stock !== undefined) {
      const newStock = Math.max(0, Number(data.stock));
      const currentProduct = await prisma.product.findUnique({ where: { id } });
      if (currentProduct) {
        const diff = newStock - currentProduct.stock;
        update.stock = newStock;
        update.availableStock = Math.max(0, currentProduct.availableStock + diff);
      }
    }
    if (data.pricePerDay !== undefined) update.pricePerDay = data.pricePerDay;
    if (data.category !== undefined) update.category = data.category;
    if (data.brand !== undefined) update.brand = data.brand;
    if (data.model !== undefined) update.model = data.model;
    if (data.condition !== undefined) update.condition = data.condition;

    const p = await prisma.product.update({ where: { id }, data: update });
    return serialize(p);
  },

  async remove(id) {
    await prisma.product.delete({ where: { id } });
    return { success: true };
  }
};
