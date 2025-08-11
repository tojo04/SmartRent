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

  async list({ 
    page = 1, 
    limit = 20, 
    search = '', 
    rentable, 
    category, 
    brand, 
    condition,
    minPrice, 
    maxPrice, 
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = {}) {
    const where = {};
    
    // Text search across name and description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Filter conditions
    if (typeof rentable === 'boolean') where.isRentable = rentable;
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (condition) where.condition = { contains: condition, mode: 'insensitive' };
    
    // Price range filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerDay = {};
      if (minPrice !== undefined) where.pricePerDay.gte = minPrice;
      if (maxPrice !== undefined) where.pricePerDay.lte = maxPrice;
    }

    const skip = (Math.max(1, +page) - 1) * Math.max(1, +limit);

    // Dynamic sorting
    const validSortFields = ['createdAt', 'updatedAt', 'name', 'pricePerDay', 'category', 'brand'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc';

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [sortField]: sortDirection },
        skip,
        take: Math.max(1, +limit)
      }),
      prisma.product.count({ where })
    ]);

    return {
      items: items.map(serialize),
      total,
      page: +page,
      limit: +limit,
      hasNext: skip + items.length < total,
      hasPrev: page > 1
    };
  },

  // Get all unique categories
  async getCategories() {
    const result = await prisma.product.findMany({
      where: { isRentable: true },
      select: { category: true },
      distinct: ['category']
    });
    return result.map(item => item.category).filter(Boolean).sort();
  },

  // Get all unique brands
  async getBrands() {
    const result = await prisma.product.findMany({
      where: { isRentable: true },
      select: { brand: true },
      distinct: ['brand']
    });
    return result.map(item => item.brand).filter(Boolean).sort();
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
