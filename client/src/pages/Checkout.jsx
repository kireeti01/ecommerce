import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building,
  AlertCircle
} from 'lucide-react';
import { clearCart } from '../store/slices/cartSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, itemsPrice, shippingPrice, taxPrice, totalPrice } = useSelector(
    (state) => state.cart
  );
  const { user } = useSelector((state) => state.auth);

  // Steps: 1 = Shipping, 2 = Payment, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Shipping details state
  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0] || {};
  const [shippingAddress, setShippingAddress] = useState({
    street: defaultAddress.street || '',
    city: defaultAddress.city || '',
    state: defaultAddress.state || '',
    postalCode: defaultAddress.postalCode || '',
    country: defaultAddress.country || 'USA',
    phone: ''
  });

  // Payment method & Mock Card state
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [cardDetails, setCardDetails] = useState({
    nameOnCard: user?.name || '',
    cardNumber: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvv: '888'
  });

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      toast.error('Please fill in all required shipping address fields');
      return;
    }
    setCurrentStep(2);
  };

  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);

      // Simulate network latency for payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const payload = {
        shippingAddress,
        paymentMethod,
        paymentDetails: {
          transactionId: `TXN_MOCK_${Date.now()}`
        }
      };

      const { data } = await api.post('/orders', payload);

      dispatch(clearCart());
      setCompletedOrder(data.order);
      setCurrentStep(3);
      toast.success('Order placed and paid successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!items || (items.length === 0 && currentStep !== 3)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">No items to checkout</h2>
        <p className="text-slate-500">Your bag is currently empty.</p>
        <Link to="/products" className="inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Checkout Stepper */}
      <div className="max-w-2xl mx-auto flex items-center justify-between relative pb-6 border-b border-slate-200">
        <div className="flex flex-col items-center space-y-1 z-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              currentStep >= 1 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-200 text-slate-500'
            }`}
          >
            1
          </div>
          <span className="text-xs font-semibold text-slate-700">Shipping</span>
        </div>

        <div className={`flex-1 h-1 mx-4 -mt-5 transition-all ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />

        <div className="flex flex-col items-center space-y-1 z-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              currentStep >= 2 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-200 text-slate-500'
            }`}
          >
            2
          </div>
          <span className="text-xs font-semibold text-slate-700">Payment</span>
        </div>

        <div className={`flex-1 h-1 mx-4 -mt-5 transition-all ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`} />

        <div className="flex flex-col items-center space-y-1 z-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              currentStep === 3 ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-200 text-slate-500'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">Confirmed</span>
        </div>
      </div>

      {/* Step 3: Success Confirmation Screen */}
      {currentStep === 3 && completedOrder && (
        <div className="max-w-xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Payment Completed Successfully
            </span>
            <h2 className="text-3xl font-black text-slate-900">Thank You for Your Order!</h2>
            <p className="text-sm text-slate-500">
              Order confirmation reference: <span className="font-mono font-bold text-slate-800">{completedOrder._id}</span>
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left text-sm space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Total Paid:</span>
              <span className="font-bold text-slate-900">${completedOrder.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping to:</span>
              <span className="font-medium text-slate-900">{completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.state}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Status:</span>
              <span className="capitalize font-bold text-indigo-600">{completedOrder.orderStatus}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={`/orders/${completedOrder._id}`}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              Track Order Details
            </Link>
            <Link
              to="/products"
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {/* Steps 1 & 2: Forms Layout */}
      {currentStep !== 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Form (Address or Payment) */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-slate-900">Delivery Address</h3>
                </div>

                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 742 Evergreen Terrace"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Springfield"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. OR"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Postal / ZIP Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 97477"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3.5 px-6 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Payment Method</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-slate-900">Payment Gateway</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Edit Address
                  </button>
                </div>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col space-y-2 ${
                      paymentMethod === 'Card' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'Card'}
                        onChange={() => setPaymentMethod('Card')}
                        className="text-indigo-600"
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-800">Credit / Debit Card</span>
                    <span className="text-[11px] text-slate-500">Instant Mock Gateway</span>
                  </label>

                  <label
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col space-y-2 ${
                      paymentMethod === 'CashOnDelivery' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Building className="w-5 h-5 text-slate-600" />
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'CashOnDelivery'}
                        onChange={() => setPaymentMethod('CashOnDelivery')}
                        className="text-indigo-600"
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-800">Cash on Delivery</span>
                    <span className="text-[11px] text-slate-500">Pay on doorstep</span>
                  </label>
                </div>

                {/* Mock Card Form Container */}
                {paymentMethod === 'Card' && (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-slate-700">Interactive Mock Payment Terminal</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-sm">Sandbox Active</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardDetails.nameOnCard}
                        onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Expires (MM/YY)</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">CVV Security Code</label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Place Order CTA */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying & Processing Payment...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Complete & Pay ${totalPrice.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Mini Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 sticky top-28">
              <h4 className="font-bold text-slate-900 pb-3 border-b border-slate-100">
                In Your Bag ({items.length})
              </h4>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 text-sm">
                    <img
                      src={
                        item.product?.images?.[0]?.url ||
                        item.image ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'
                      }
                      alt={item.product?.name || item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate text-xs">
                        {item.product?.name || item.name}
                      </p>
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-slate-900 text-xs">
                      ${((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">${itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-semibold text-slate-800">
                    {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax:</span>
                  <span className="font-semibold text-slate-800">${taxPrice.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total:</span>
                  <span className="text-base text-indigo-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
