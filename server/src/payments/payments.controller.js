import { PaymentsService } from './payments.service.js';

export const PaymentsController = {
  createRazorpayOrder: async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount) {
        return res.status(400).json({ message: 'Amount is required' });
      }

      const order = await PaymentsService.createRazorpayOrder(amount);
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error('❌ Razorpay order creation failed:', error.message);
      res.status(500).json({ message: 'Payment initialization failed' });
    }
  },
};
