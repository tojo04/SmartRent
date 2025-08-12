import { prisma } from '../db/postgres.js';

export class ReportsService {
  // Get dashboard overview statistics
  static async getDashboardStats() {
    try {
      const [totalProducts, totalRentals, activeRentals, revenueResult] = await Promise.all([
        prisma.product.count().catch(() => 0),
        prisma.rental.count().catch(() => 0),
        prisma.rental.count({
          where: { 
            status: { 
              in: ['CONFIRMED', 'PICKED_UP'] 
            } 
          }
        }).catch(() => 0),
        prisma.rental.aggregate({
          _sum: { totalPrice: true }
        }).catch(() => ({ _sum: { totalPrice: 0 } }))
      ]);

      const totalRevenue = Number(revenueResult._sum.totalPrice || 0);

      return {
        totalProducts,
        totalRentals,
        activeRentals,
        totalRevenue
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalProducts: 0,
        totalRentals: 0,
        activeRentals: 0,
        totalRevenue: 0
      };
    }
  }

  // Get top categories by rental count
  static async getTopCategories(limit = 10) {
    try {
      // Get all products first
      const products = await prisma.product.findMany({
        select: {
          id: true,
          category: true
        }
      }).catch(() => []);

      if (products.length === 0) {
        return [];
      }

      // Group by category and count rentals
      const categoryMap = new Map();
      
      for (const product of products) {
        const category = product.category || 'Uncategorized';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { name: category, count: 0 });
        }
        
        const rentalCount = await prisma.rental.count({
          where: { productId: product.id }
        }).catch(() => 0);
        
        categoryMap.get(category).count += rentalCount;
      }

      return Array.from(categoryMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top categories:', error);
      return [];
    }
  }

  // Get top products by rental count and revenue
  static async getTopProducts(limit = 10) {
    try {
      // Get products with rental counts
      const productsWithRentals = await prisma.product.findMany({
        include: {
          rentals: {
            select: {
              totalPrice: true
            }
          }
        }
      }).catch(() => []);

      // Calculate metrics for each product
      const productStats = productsWithRentals.map(product => {
        const rentalCount = product.rentals.length;
        const totalRevenue = product.rentals.reduce((sum, rental) => 
          sum + Number(rental.totalPrice || 0), 0
        );

        return {
          id: product.id,
          name: product.name,
          category: product.category,
          rentalCount,
          totalRevenue
        };
      });

      // Sort by rental count and return top products
      return productStats
        .sort((a, b) => b.rentalCount - a.rentalCount)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top products:', error);
      return [];
    }
  }

  // Get top customers by rental count and spending
  static async getTopCustomers(limit = 10) {
    try {
      // Get all rentals and group by user
      const rentals = await prisma.rental.findMany({
        select: {
          userId: true,
          userEmail: true,
          userName: true,
          totalPrice: true
        }
      }).catch(() => []);

      // Group by userId
      const customerMap = new Map();
      
      for (const rental of rentals) {
        const userId = rental.userId;
        if (!customerMap.has(userId)) {
          customerMap.set(userId, {
            id: userId,
            email: rental.userEmail,
            name: rental.userName,
            rentalCount: 0,
            totalSpent: 0
          });
        }
        
        const customer = customerMap.get(userId);
        customer.rentalCount += 1;
        customer.totalSpent += Number(rental.totalPrice || 0);
      }

      return Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top customers:', error);
      return [];
    }
  }

  // Get revenue trends over time
  static async getRevenueTrends(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get rentals from the specified period
      const rentals = await prisma.rental.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        select: {
          createdAt: true,
          totalPrice: true
        }
      }).catch(() => []);

      // Group by date
      const revenueByDate = new Map();
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        revenueByDate.set(dateStr, { period: dateStr, revenue: 0 });
      }

      // Add rental data
      for (const rental of rentals) {
        const dateStr = rental.createdAt.toISOString().split('T')[0];
        if (revenueByDate.has(dateStr)) {
          revenueByDate.get(dateStr).revenue += Number(rental.totalPrice || 0);
        }
      }

      return Array.from(revenueByDate.values())
        .sort((a, b) => new Date(a.period) - new Date(b.period));
    } catch (error) {
      console.error('Error getting revenue trends:', error);
      return [];
    }
  }

  // Get complete analytics report
  static async getAnalyticsReport() {
    try {
      const [dashboardStats, topCategories, topProducts, topCustomers, revenueTrends] = await Promise.all([
        this.getDashboardStats(),
        this.getTopCategories(5),
        this.getTopProducts(5),
        this.getTopCustomers(5),
        this.getRevenueTrends(30)
      ]);

      return {
        dashboardStats,
        topCategories,
        topProducts,
        topCustomers,
        revenueTrends
      };
    } catch (error) {
      console.error('Error getting analytics report:', error);
      return {
        dashboardStats: {
          totalProducts: 0,
          totalRentals: 0,
          activeRentals: 0,
          totalRevenue: 0
        },
        topCategories: [],
        topProducts: [],
        topCustomers: [],
        revenueTrends: []
      };
    }
  }
}
