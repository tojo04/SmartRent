import { RentalsService } from './rentals.service.js';

export const RentalsController = {
  // Create a new rental (customer)
  create: async (req, res) => {
    try {
      const { productId, startDate, endDate, notes } = req.body;
      const user = req.user;
      
      if (!productId || !startDate || !endDate) {
        return res.status(400).json({ 
          message: 'productId, startDate, and endDate are required' 
        });
      }
      
      const rental = await RentalsService.create({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        productId,
        startDate,
        endDate,
        notes
      });
      
      console.log(`📝 Rental created: ${user.email} -> ${rental.product?.name}`);
      res.status(201).json({ rental });
    } catch (error) {
      console.error(`❌ Rental creation failed:`, error.message);
      res.status(400).json({ message: error.message });
    }
  },
  
  // List all rentals (admin) or user's rentals (customer)
  list: async (req, res) => {
    try {
      const user = req.user;
      const { page, limit, status, search } = req.query;
      
      let options = { page, limit, status, search };
      
      // If not admin, only show user's own rentals
      if (user.role !== 'admin') {
        options.userId = user.id;
      }
      
      const result = await RentalsService.list(options);
      res.json(result);
    } catch (error) {
      console.error(`❌ Rental list failed:`, error.message);
      res.status(500).json({ message: 'Failed to fetch rentals' });
    }
  },
  
  // Get specific rental
  getOne: async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      const rental = await RentalsService.getById(id);
      
      if (!rental) {
        return res.status(404).json({ message: 'Rental not found' });
      }
      
      // Check permissions - users can only see their own rentals
      if (user.role !== 'admin' && rental.userId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json({ rental });
    } catch (error) {
      console.error(`❌ Get rental failed:`, error.message);
      res.status(500).json({ message: 'Failed to fetch rental' });
    }
  },
  
  // Update rental status (admin only)
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user;
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      
      const validStatuses = ['PENDING', 'CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED', 'OVERDUE'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const rental = await RentalsService.updateStatus(id, status, user.id);
      
      console.log(`🔄 Rental status updated: ${rental.id} -> ${status}`);
      res.json({ rental });
    } catch (error) {
      console.error(`❌ Rental status update failed:`, error.message);
      res.status(400).json({ message: error.message });
    }
  },
  
  // Get user's active rental
  getActiveRental: async (req, res) => {
    try {
      const user = req.user;
      const rental = await RentalsService.getUserActiveRental(user.id);
      
      res.json({ rental });
    } catch (error) {
      console.error(`❌ Get active rental failed:`, error.message);
      res.status(500).json({ message: 'Failed to fetch active rental' });
    }
  },
  
  // Get user's rental history
  getMyRentals: async (req, res) => {
    try {
      const user = req.user;
      const { page, limit } = req.query;
      
      const result = await RentalsService.getUserRentals(user.id, { page, limit });
      res.json(result);
    } catch (error) {
      console.error(`❌ Get user rentals failed:`, error.message);
      res.status(500).json({ message: 'Failed to fetch rental history' });
    }
  },

  // Create formal rental order (admin)
  createOrder: async (req, res) => {
    try {
      const orderData = req.body;
      const user = req.user;
      
      const result = await RentalsService.createFormalOrder(orderData, user.id);
      res.json({ success: true, order: result });
    } catch (error) {
      console.error('Failed to create rental order:', error);
      res.status(400).json({ message: error.message });
    }
  },

  // Generate PDF invoice
  generatePDF: async (req, res) => {
    try {
      const { id } = req.params;
      const orderData = req.body || {};
      
      console.log(`📄 Generating PDF for rental: ${id}`);
      
      const result = await RentalsService.generatePDFInvoice(id, orderData);
      
      res.json({ 
        success: true, 
        message: result.message,
        filename: result.filename
      });
    } catch (error) {
      console.error('❌ PDF generation failed:', error.message);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to generate PDF'
      });
    }
  },

  // Generate and download PDF receipt
  downloadPDF: async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`📥 Generating PDF download for rental: ${id}`);
      
      const result = await RentalsService.generateRentalReceipt(id);
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.pdfBuffer.length);
      
      // Send PDF buffer
      res.send(result.pdfBuffer);
    } catch (error) {
      console.error('❌ PDF download failed:', error.message);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to download PDF'
      });
    }
  }
};
