import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '@/store/cartStore';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Wallet, Banknote, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { slideUp, fadeIn } from '@/lib/animations';
import { couponService } from '@/services/coupon';
import { toast } from 'sonner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_mock');

type PaymentMethod = 'card' | 'paypal' | 'cash';

const paymentMethods = [
  {
    id: 'card',
    name: 'Credit / Debit Card',
    description: 'Pay securely with your card via Stripe',
    icon: CreditCard,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Fast and secure PayPal checkout',
    icon: Wallet,
  },
  {
    id: 'cash',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: Banknote,
  },
];

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/orders',
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'An unexpected error occurred.');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Payment succeeded!');
      clearCart();
      navigate('/orders');
    } else {
      setMessage('Something went wrong.');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="mb-6" />
      <Button 
        disabled={isProcessing || !stripe || !elements} 
        className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/25"
      >
        {isProcessing ? 'Processing...' : (
          <span className="flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" /> Pay Now
          </span>
        )}
      </Button>
      {message && <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{message}</div>}
    </form>
  );
};

const Checkout = () => {
  const { items, total, clearCart } = useCartStore();
  const [clientSecret, setClientSecret] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length > 0 && selectedMethod === 'card') {
      api
        .post('/payments/create-intent', {})
        .then((res) => setClientSecret(res.data.data?.clientSecret ?? ''))
        .catch((err) => console.error(err));
    }
  }, [items, selectedMethod]);

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isProcessingCash, setIsProcessingCash] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    try {
      const result = await couponService.validate(couponCode, total());
      setDiscount(result.discountAmount);
      setAppliedCoupon(couponCode);
      toast.success(`Coupon applied! You saved $${result.discountAmount.toFixed(2)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
      setDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const finalTotal = total() + (total() * 0.1) - discount;

  const handleCashOrder = async () => {
    // Validate billing info
    if (!billingInfo.fullName || !billingInfo.email || !billingInfo.phone || !billingInfo.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessingCash(true);
    
    // For cash on delivery, create order directly
    try {
      const response = await api.post('/orders', {
        items,
        shippingAddress: billingInfo,
        paymentMethod: 'CASH',
        discount,
        couponCode: appliedCoupon,
      });
      
      console.log('Order created successfully:', response.data);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error: any) {
      console.error('Order creation failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create order. Please try again.';
      // Don't show raw Prisma errors
      if (errorMessage.includes('Prisma') || errorMessage.includes('invocation')) {
        toast.error('Something went wrong while processing your order. Please try again.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsProcessingCash(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div 
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Secure Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase securely</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Payment & Billing */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              {/* Payment Method Selection */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          selectedMethod === method.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <method.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{method.name}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </div>
                        {selectedMethod === method.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-6 w-6 bg-primary rounded-full flex items-center justify-center"
                          >
                            <Check className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Billing Information */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Billing Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Full Name *</label>
                    <Input
                      placeholder="John Doe"
                      value={billingInfo.fullName}
                      onChange={(e) => setBillingInfo({ ...billingInfo, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email *</label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={billingInfo.email}
                        onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone *</label>
                      <Input
                        type="tel"
                        placeholder="+1234567890"
                        value={billingInfo.phone}
                        onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Address *</label>
                    <Input
                      placeholder="123 Main Street"
                      value={billingInfo.address}
                      onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">City</label>
                      <Input
                        placeholder="New York"
                        value={billingInfo.city}
                        onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">ZIP Code</label>
                      <Input
                        placeholder="10001"
                        value={billingInfo.zipCode}
                        onChange={(e) => setBillingInfo({ ...billingInfo, zipCode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <AnimatePresence mode="wait">
                {selectedMethod === 'card' && (
                  <motion.div
                    key="card-payment"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <CreditCard className="h-16 w-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-lg font-semibold mb-2">Secure Card Payment</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Credit / Debit card payment will be available soon
                      </p>
                      <Button className="w-full" disabled>
                        Pay with Card (Coming Soon)
                      </Button>
                    </div>
                  </motion.div>
                )}

                {selectedMethod === 'paypal' && (
                  <motion.div
                    key="paypal-payment"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <Wallet className="h-16 w-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-lg font-semibold mb-2">PayPal Integration</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        PayPal payment will be available soon
                      </p>
                      <Button className="w-full" disabled>
                        Pay with PayPal (Coming Soon)
                      </Button>
                    </div>
                  </motion.div>
                )}

                {selectedMethod === 'cash' && (
                  <motion.div
                    key="cash-payment"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-4">
                      <Banknote className="h-12 w-12 mx-auto mb-3 text-amber-600" />
                      <h3 className="text-lg font-semibold mb-2">Cash on Delivery</h3>
                      <p className="text-sm text-muted-foreground">
                        You will pay when your order is delivered to your address
                      </p>
                    </div>
                    <Button 
                      onClick={handleCashOrder}
                      disabled={isProcessingCash}
                      className="w-full h-12 text-lg rounded-xl"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Lock className="h-4 w-4" /> {isProcessingCash ? 'Processing...' : 'Place Order'}
                      </span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column - Order Summary */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
              <div 
                className="flex justify-between items-center mb-4 cursor-pointer"
                onClick={() => setShowOrderSummary(!showOrderSummary)}
              >
                <h2 className="text-xl font-bold">Order Summary</h2>
                {showOrderSummary ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>

              <AnimatePresence>
                {showOrderSummary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-sm font-semibold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Coupon Code Input */}
              <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium mb-2 block">Discount Code</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter coupon code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <Button variant="destructive" onClick={handleRemoveCoupon}>Remove</Button>
                  ) : (
                    <Button onClick={handleApplyCoupon} disabled={!couponCode || isValidatingCoupon}>
                      {isValidatingCoupon ? '...' : 'Apply'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (estimated)</span>
                  <span>${(total() * 0.1).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                  <Lock className="h-4 w-4" />
                  <span className="font-medium">Secure checkout guaranteed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
