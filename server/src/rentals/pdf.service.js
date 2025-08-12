import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PDFService = {
  async generateRentalInvoice(rental, orderData) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Generate HTML content for the invoice
      const htmlContent = this.generateInvoiceHTML(rental, orderData);
      
      // Set viewport for consistent rendering
      await page.setViewport({ width: 1200, height: 800 });
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      return pdfBuffer;
    } finally {
      await browser.close();
    }
  },

  generateInvoiceHTML(rental, orderData) {
    const formatCurrency = (amount) => `₹${Number(amount).toLocaleString()}`;
    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');
    
    const { untaxedTotal, tax, total } = orderData;
    const cssPath = path.join(__dirname, '../../public/invoice-styles.css');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rental Invoice - R${rental.id.slice(0, 6)}</title>
      <link rel="stylesheet" href="file://${cssPath}">
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="logo">SmartRent</div>
          <div class="invoice-info">
            <div class="invoice-title">RENTAL INVOICE</div>
            <div class="invoice-number">R${rental.id.slice(0, 6)}</div>
            <div style="margin-top: 10px;">
              <span class="status-badge status-${rental.status.toLowerCase()}">${rental.status}</span>
            </div>
          </div>
        </div>

        <div class="content">
          <!-- Customer and Order Information -->
          <div class="section">
            <div class="info-grid">
              <div>
                <div class="section-title">Customer Information</div>
                <div class="info-item">
                  <div class="info-label">Customer:</div>
                  <div class="info-value">${rental.userName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email:</div>
                  <div class="info-value">${rental.userEmail}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Invoice Address:</div>
                  <div class="info-value">${orderData.invoiceAddress || 'Not provided'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Delivery Address:</div>
                  <div class="info-value">${orderData.deliveryAddress || 'Not provided'}</div>
                </div>
              </div>
              <div>
                <div class="section-title">Order Details</div>
                <div class="info-item">
                  <div class="info-label">Order Date:</div>
                  <div class="info-value">${formatDate(rental.createdAt)}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Rental Period:</div>
                  <div class="info-value">${formatDate(rental.startDate)} - ${formatDate(rental.endDate)}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Duration:</div>
                  <div class="info-value">${rental.totalDays} days</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Template:</div>
                  <div class="info-value">${orderData.rentalTemplate || 'Standard Rental'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Price List:</div>
                  <div class="info-value">${orderData.priceList || 'Standard'}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="section">
            <div class="section-title">Order Items</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Tax</th>
                  <th>Sub Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderData.items.map(item => `
                  <tr>
                    <td>${item.product}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.unitPrice)}</td>
                    <td>${formatCurrency(item.tax)}</td>
                    <td>${formatCurrency(item.subTotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="totals">
            <div class="totals-row">
              <span>Untaxed Total:</span>
              <span>${formatCurrency(untaxedTotal)}</span>
            </div>
            <div class="totals-row">
              <span>Tax:</span>
              <span>${formatCurrency(tax)}</span>
            </div>
            <div class="totals-row total">
              <span>Total:</span>
              <span>${formatCurrency(total)}</span>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div class="terms">
            <h4>Terms & Conditions</h4>
            <p>${orderData.termsConditions || 'Standard terms and conditions apply for this rental agreement.'}</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p><strong>SmartRent</strong> - Professional Rental Management Platform</p>
            <p>Generated on ${formatDate(new Date())} | Invoice #R${rental.id.slice(0, 6)}</p>
            <p>For support, contact us at support@smartrent.com | +91 98765 43210</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  },

  // Alternative method using HTML template for better styling
  async generateRentalInvoiceAdvanced(rental, orderData) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Enhanced HTML with better styling
      const htmlContent = this.generateAdvancedInvoiceHTML(rental, orderData);
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' }
      });
      
      return pdfBuffer;
    } finally {
      await browser.close();
    }
  },

  generateAdvancedInvoiceHTML(rental, orderData) {
    const formatCurrency = (amount) => `₹${Number(amount).toLocaleString()}`;
    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SmartRent Invoice</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', system-ui, sans-serif; 
          color: #1f2937; 
          background: white;
          font-size: 14px;
        }
        .invoice { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white;
          min-height: 100vh;
        }
        .header { 
          background: linear-gradient(135deg, #6366f1, #8b5cf6); 
          color: white; 
          padding: 40px 30px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
        }
        .logo { font-size: 32px; font-weight: bold; }
        .invoice-details { text-align: right; }
        .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
        .invoice-number { font-size: 18px; opacity: 0.9; }
        .content { padding: 30px; }
        .info-section { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 40px; 
          margin-bottom: 40px; 
        }
        .info-group h3 { 
          color: #6366f1; 
          font-size: 16px; 
          margin-bottom: 15px; 
          padding-bottom: 8px; 
          border-bottom: 2px solid #e5e7eb; 
        }
        .info-row { 
          display: flex; 
          margin-bottom: 8px; 
        }
        .info-label { 
          font-weight: 600; 
          width: 120px; 
          color: #374151; 
        }
        .info-value { 
          color: #6b7280; 
          flex: 1; 
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 30px 0; 
          border: 1px solid #e5e7eb;
        }
        .items-table th { 
          background: linear-gradient(135deg, #6366f1, #8b5cf6); 
          color: white; 
          padding: 15px 12px; 
          text-align: left; 
          font-weight: 600; 
        }
        .items-table td { 
          padding: 12px; 
          border-bottom: 1px solid #e5e7eb; 
        }
        .items-table tr:nth-child(even) { 
          background: #f9fafb; 
        }
        .totals-section { 
          display: flex; 
          justify-content: flex-end; 
          margin: 30px 0; 
        }
        .totals-box { 
          background: #f9fafb; 
          padding: 25px; 
          border-radius: 8px; 
          min-width: 300px; 
          border: 1px solid #e5e7eb;
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 8px; 
        }
        .total-row.final { 
          border-top: 2px solid #374151; 
          padding-top: 12px; 
          margin-top: 12px; 
          font-weight: bold; 
          font-size: 18px; 
          color: #1f2937; 
        }
        .terms-section { 
          background: #f0f9ff; 
          padding: 25px; 
          border-radius: 8px; 
          border-left: 4px solid #6366f1; 
          margin: 30px 0; 
        }
        .terms-title { 
          font-size: 16px; 
          font-weight: bold; 
          margin-bottom: 12px; 
          color: #1f2937; 
        }
        .footer { 
          text-align: center; 
          padding: 25px; 
          border-top: 1px solid #e5e7eb; 
          color: #6b7280; 
          font-size: 12px; 
          background: #f9fafb;
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div class="logo">SmartRent</div>
          <div class="invoice-details">
            <div class="invoice-title">RENTAL INVOICE</div>
            <div class="invoice-number">R${rental.id.slice(0, 6)}</div>
          </div>
        </div>
        
        <div class="content">
          <div class="info-section">
            <div class="info-group">
              <h3>Customer Information</h3>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${rental.userName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${rental.userEmail}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Invoice Address:</span>
                <span class="info-value">${orderData.invoiceAddress || 'Not provided'}</span>
              </div>
            </div>
            <div class="info-group">
              <h3>Order Information</h3>
              <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span class="info-value">${formatDate(rental.createdAt)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Start Date:</span>
                <span class="info-value">${formatDate(rental.startDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">End Date:</span>
                <span class="info-value">${formatDate(rental.endDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Duration:</span>
                <span class="info-value">${rental.totalDays} days</span>
              </div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Tax</th>
                <th>Sub Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.items.map(item => `
                <tr>
                  <td><strong>${item.product}</strong></td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.tax)}</td>
                  <td><strong>${formatCurrency(item.subTotal)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals-section">
            <div class="totals-box">
              <div class="total-row">
                <span>Untaxed Total:</span>
                <span>${formatCurrency(orderData.untaxedTotal)}</span>
              </div>
              <div class="total-row">
                <span>Tax (GST):</span>
                <span>${formatCurrency(orderData.tax)}</span>
              </div>
              <div class="total-row final">
                <span>Total Amount:</span>
                <span>${formatCurrency(orderData.total)}</span>
              </div>
            </div>
          </div>
          
          <div class="terms-section">
            <div class="terms-title">Terms & Conditions</div>
            <p>${orderData.termsConditions}</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>SmartRent</strong> - Professional Rental Management Platform</p>
          <p>Generated on ${formatDate(new Date())} | Invoice #R${rental.id.slice(0, 6)}</p>
          <p>For support: support@smartrent.com | +91 98765 43210</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
};