'use client';

/**
 * Payment Form Component
 * Handles payment method selection and processing
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface PaymentFormProps {
  bookingId: string;
  amount: number;
}

type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

const paymentMethods = [
  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  { id: 'upi', label: 'UPI', icon: Smartphone, description: 'GPay, PhonePe, Paytm' },
  { id: 'netbanking', label: 'Net Banking', icon: Building2, description: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, description: 'Paytm, Amazon Pay' },
] as const;

export function PaymentForm({ bookingId, amount }: PaymentFormProps) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  // UPI state
  const [upiId, setUpiId] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would:
      // 1. Call Razorpay/Stripe to create payment intent
      // 2. Process payment
      // 3. Confirm booking via API
      
      // Redirect to confirmation page
      router.push(`/booking/${bookingId}/confirmation`);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (selectedMethod === 'card') {
      return cardNumber.replace(/\s/g, '').length === 16 &&
             expiry.length === 5 &&
             cvv.length >= 3 &&
             cardName.length >= 2;
    }
    if (selectedMethod === 'upi') {
      return upiId.includes('@');
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Payment Method
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedMethod === method.id
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <method.icon className={`w-5 h-5 ${
                  selectedMethod === method.id ? 'text-brand-600' : 'text-gray-500'
                }`} />
                <span className={`font-medium ${
                  selectedMethod === method.id ? 'text-brand-700' : 'text-gray-900'
                }`}>
                  {method.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 ml-8">{method.description}</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Payment Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Details
        </h2>
        
        {selectedMethod === 'card' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Card Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  CVV
                </label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="•••"
                  maxLength={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Name on Card
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
        
        {selectedMethod === 'upi' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              UPI ID
            </label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter your UPI ID (e.g., name@okicici, name@ybl)
            </p>
          </div>
        )}
        
        {selectedMethod === 'netbanking' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Bank
            </label>
            <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent">
              <option value="">Select your bank</option>
              <option value="sbi">State Bank of India</option>
              <option value="hdfc">HDFC Bank</option>
              <option value="icici">ICICI Bank</option>
              <option value="axis">Axis Bank</option>
              <option value="kotak">Kotak Mahindra Bank</option>
              <option value="pnb">Punjab National Bank</option>
            </select>
          </div>
        )}
        
        {selectedMethod === 'wallet' && (
          <div className="grid grid-cols-3 gap-3">
            {['Paytm', 'Amazon Pay', 'Mobikwik'].map((wallet) => (
              <button
                key={wallet}
                className="p-4 border border-gray-200 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition-colors text-center"
              >
                <span className="text-sm font-medium text-gray-700">{wallet}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Pay Button */}
      <Button
        onClick={handlePayment}
        disabled={loading || !isFormValid()}
        className="w-full py-4 text-lg"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Pay ₹{amount.toLocaleString('en-IN')}
          </>
        )}
      </Button>
      
      {/* Terms */}
      <p className="text-xs text-center text-gray-500">
        By completing this payment, you agree to our{' '}
        <a href="/terms" className="text-brand-600 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</a>.
      </p>
    </div>
  );
}
