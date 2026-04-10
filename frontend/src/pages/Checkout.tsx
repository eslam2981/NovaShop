import { useState } from 'react';

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

const Checkout = () => {
  const { items, total, clearCart } = useCartStore();
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
    <div className="min-h-[calc(100vh-80px)] bg-neutral-50/50 dark:bg-zinc-950/50 py-12 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div 
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tighter text-black dark:text-white">Secure Checkout</h1>
          <p className="text-neutral-500 font-medium">Complete your purchase securely</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Payment & Billing */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2rem] shadow-xl shadow-black/5 dark:shadow-none border border-neutral-200 dark:border-zinc-800/50">
              {/* Payment Method Selection */}
              <div className="mb-10">
                <h2 className="text-2xl font-black mb-6 tracking-tighter text-black dark:text-white">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        selectedMethod === method.id
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                          : 'border-neutral-100 dark:border-zinc-800/50 hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-zinc-900/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          selectedMethod === method.id ? 'bg-primary text-white' : 'bg-neutral-100 dark:bg-zinc-900 text-neutral-500'
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
              <div className="mb-8">
                <h2 className="text-2xl font-black mb-6 tracking-tighter text-black dark:text-white">Billing Information</h2>
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
                    <div className="text-center p-10 bg-neutral-50 dark:bg-zinc-900/50 rounded-2xl border border-neutral-100 dark:border-zinc-800/50">
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
                    <div className="text-center p-10 bg-neutral-50 dark:bg-zinc-900/50 rounded-2xl border border-neutral-100 dark:border-zinc-800/50">
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
                    <div className="text-center p-8 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/50 mb-6">
                      <Banknote className="h-14 w-14 mx-auto mb-4 text-amber-500" />
                      <h3 className="text-xl font-black mb-2 text-amber-900 dark:text-amber-500">Cash on Delivery</h3>
                      <p className="text-sm font-medium text-amber-700/70 dark:text-amber-500/70">
                        You will pay when your order is delivered to your address
                      </p>
                    </div>
                    <Button 
                      onClick={handleCashOrder}
                      disabled={isProcessingCash}
                      className="w-full h-14 text-lg rounded-xl font-bold bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] transition-transform shadow-xl shadow-primary/20"
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
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2rem] shadow-xl shadow-black/5 dark:shadow-none border border-neutral-200 dark:border-zinc-800/50 sticky top-24">
              <div 
                className="flex justify-between items-center mb-6 cursor-pointer group"
                onClick={() => setShowOrderSummary(!showOrderSummary)}
              >
                <h2 className="text-2xl font-black tracking-tighter text-black dark:text-white">Order Summary</h2>
                {showOrderSummary ? <ChevronUp className="h-6 w-6 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" /> : <ChevronDown className="h-6 w-6 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />}
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
                    <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4 p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-zinc-900/50 transition-colors border border-transparent dark:hover:border-zinc-800/50">
                          {item.image && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-zinc-900">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 flex flex-col justify-center">
                            <h3 className="font-bold text-sm line-clamp-1 text-black dark:text-white">{item.name}</h3>
                            <p className="text-xs font-semibold text-neutral-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="flex items-center text-sm font-black text-black dark:text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Coupon Code Input */}
              <div className="mb-8 pt-6 border-t border-neutral-100 dark:border-zinc-800/50">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Discount Code</label>
                <div className="flex gap-3">
                  <Input 
                    placeholder="Enter coupon code" 
                    value={couponCode}
                    className="rounded-xl bg-neutral-50 dark:bg-zinc-900/50 border-neutral-200 dark:border-zinc-800 h-12 font-bold"
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <Button variant="destructive" onClick={handleRemoveCoupon}>Remove</Button>
                  ) : (
                    <Button onClick={handleApplyCoupon} disabled={!couponCode || isValidatingCoupon} className="h-12 rounded-xl font-bold px-6">
                      {isValidatingCoupon ? '...' : 'Apply'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="border-t border-neutral-100 dark:border-zinc-800/50 pt-6 space-y-3">
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
                <div className="border-t border-neutral-100 dark:border-zinc-800/50 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-lg text-black dark:text-white uppercase tracking-tighter">Total</span>
                    <span className="text-3xl font-black text-black dark:text-white">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm">
                  <Lock className="h-4 w-4" />
                  <span className="font-bold">Secure checkout guaranteed</span>
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
