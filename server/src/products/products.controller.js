import { ProductsService } from './products.service.js';

export const ProductsController = {
  create: async (req, res) => {
    try {
      const { name, pricePerDay } = req.body || {};
      if (!name || pricePerDay === undefined) {
        return res.status(400).json({ message: 'name and pricePerDay are required' });
      }
      const product = await ProductsService.create(req.body);
      res.status(201).json({ product });
    } catch (e) {
      res.status(400).json({ message: e.message || 'Create failed' });
    }
  },

  list: async (req, res) => {
    try {
      const { 
        page, 
        limit, 
        search, 
        rentable, 
        category, 
        brand, 
        condition,
        minPrice, 
        maxPrice, 
        sortBy, 
        sortOrder 
      } = req.query;
      
      const out = await ProductsService.list({
        page,
        limit,
        search,
        rentable: rentable === undefined ? undefined : rentable === 'true',
        category,
        brand,
        condition,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        sortBy,
        sortOrder
      });
      res.json(out);
    } catch {
      res.status(500).json({ message: 'List failed' });
    }
  },

  // Get all categories for filters
  getCategories: async (req, res) => {
    try {
      const categories = await ProductsService.getCategories();
      res.json({ categories });
    } catch {
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  },

  // Get all brands for filters
  getBrands: async (req, res) => {
    try {
      const brands = await ProductsService.getBrands();
      res.json({ brands });
    } catch {
      res.status(500).json({ message: 'Failed to fetch brands' });
    }
  },

  getOne: async (req, res) => {
    const product = await ProductsService.getById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json({ product });
  },

  update: async (req, res) => {
    try {
      const product = await ProductsService.update(req.params.id, req.body || {});
      if (!product) return res.status(404).json({ message: 'Not found' });
      res.json({ product });
    } catch (e) {
      res.status(400).json({ message: e.message || 'Update failed' });
    }
  },

  remove: async (req, res) => {
    try {
      await ProductsService.remove(req.params.id);
      res.json({ success: true });
    } catch {
      res.status(404).json({ message: 'Not found' });
    }
  }
};
