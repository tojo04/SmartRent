import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const PaymentsService = {
  createRazorpayOrder: async (amount) => {
    if (!amount) throw new Error('Amount is required');
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `sr_order_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    return order;
  },
};
