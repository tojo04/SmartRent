import nodemailer from 'nodemailer';

class NotificationsService {
  constructor() {
    // Initialize the transporter for sending emails
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address from environment variables
        pass: process.env.GMAIL_PASS  // Your Gmail password or app password
      }
    });
  }

  /**
   * Sends an email.
   * @param {string} to - The recipient's email address.
   * @param {string} subject - The subject of the email.
   * @param {string} html - The HTML body of the email.
   * @returns {Promise<boolean>} - True if the email was sent successfully.
   */
  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email notification');
    }
  }

  /**
   * Sends an OTP email to the user.
   * @param {string} userEmail - The recipient's email address.
   * @param {string} otp - The one-time password.
   * @returns {Promise<boolean>}
   */
  async sendOTPEmail(userEmail, otp) {
    const subject = 'Your OTP for SmartRent';
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Your One-Time Password</h2>
        <p>Dear Customer,</p>
        <p>Your OTP is: <strong style="font-size: 1.2em;">${otp}</strong></p>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thank you for using SmartRent!</p>
      </div>
    `;
    return this.sendEmail(userEmail, subject, html);
  }


  /**
   * Sends a rental confirmation email.
   * @param {string} userEmail - The user's email.
   * @param {object} rentalDetails - Details of the rental.
   * @returns {Promise<boolean>}
   */
  async sendRentalConfirmation(userEmail, rentalDetails) {
    const subject = 'Rental Confirmation - SmartRent';
    const html = `
      <h2>Your Rental is Confirmed!</h2>
      <p>Dear Customer,</p>
      <p>Your rental order has been confirmed with the following details:</p>
      <ul>
        <li>Order ID: ${rentalDetails.orderId}</li>
        <li>Product: ${rentalDetails.productName}</li>
        <li>Duration: ${rentalDetails.duration}</li>
        <li>Total Amount: $${rentalDetails.amount}</li>
      </ul>
      <p>Thank you for choosing SmartRent!</p>
    `;
    return this.sendEmail(userEmail, subject, html);
  }

  /**
   * Sends a payment confirmation email.
   * @param {string} userEmail - The user's email.
   * @param {object} paymentDetails - Details of the payment.
   * @returns {Promise<boolean>}
   */
  async sendPaymentConfirmation(userEmail, paymentDetails) {
    const subject = 'Payment Confirmation - SmartRent';
    const html = `
      <h2>Payment Successful</h2>
      <p>Dear Customer,</p>
      <p>We've received your payment:</p>
      <ul>
        <li>Transaction ID: ${paymentDetails.transactionId}</li>
        <li>Amount: $${paymentDetails.amount}</li>
        <li>Date: ${new Date().toLocaleDateString()}</li>
      </ul>
      <p>Thank you for your payment!</p>
    `;
    return this.sendEmail(userEmail, subject, html);
  }

  /**
   * Sends a rental return reminder email.
   * @param {string} userEmail - The user's email.
   * @param {object} rentalDetails - Details of the rental.
   * @returns {Promise<boolean>}
   */
  async sendReturnReminder(userEmail, rentalDetails) {
    const subject = 'Rental Return Reminder - SmartRent';
    const html = `
      <h2>Rental Return Reminder</h2>
      <p>Dear Customer,</p>
      <p>This is a reminder that your rental period for ${rentalDetails.productName} 
         is ending on ${rentalDetails.returnDate}.</p>
      <p>Please ensure timely return to avoid any additional charges.</p>
      <p>Thank you for using SmartRent!</p>
    `;
    return this.sendEmail(userEmail, subject, html);
  }
}

// Export a single instance of the service as the default export
export default new NotificationsService();
