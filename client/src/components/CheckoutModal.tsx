import React, { useState } from 'react';
import {
  Sparkles,
  CreditCard,
  ShieldCheck,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Smartphone,
  Lock,
  Tv,
  Film,
  Calendar,
  Receipt
} from 'lucide-react';
import { Plan } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

interface CheckoutModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrderConfirmationData {
  transactionId: string;
  orderId?: string;
  planName: string;
  amount: number;
  formattedPrice: string;
  paymentMethod: string;
  validUntil: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [paymentTab, setPaymentTab] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [step, setStep] = useState<'checkout' | 'confirmed'>('checkout');

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4532 8920 1123 4242');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Rohan Verma');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('883');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Billing Address Inputs
  const [addressLine, setAddressLine] = useState('Flat 402, Royale Heights');
  const [city, setCity] = useState('Mumbai');
  const [stateName, setStateName] = useState('Maharashtra');
  const [pinCode, setPinCode] = useState('400001');

  // UPI State
  const [upiId, setUpiId] = useState('rohan@okhdfcbank');
  const [isUpiVerified, setIsUpiVerified] = useState(true);
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);

  // Processing & Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmationData | null>(null);

  if (!isOpen || !plan) return null;

  // Detect card brand based on prefix
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (/^4/.test(clean)) return { name: 'VISA', color: 'from-blue-700 to-indigo-950', badge: 'bg-blue-600 text-white' };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', color: 'from-red-700 to-orange-900', badge: 'bg-red-600 text-white' };
    if (/^(60|65|81|82)/.test(clean)) return { name: 'RuPay', color: 'from-emerald-700 to-teal-950', badge: 'bg-emerald-600 text-white' };
    if (/^3[47]/.test(clean)) return { name: 'AMEX', color: 'from-cyan-800 to-blue-950', badge: 'bg-cyan-600 text-white' };
    return { name: 'RuPay / Visa', color: 'from-slate-800 via-indigo-950 to-blue-950', badge: 'bg-gold text-black' };
  };

  const currentBrand = getCardBrand(cardNumber);

  // Auto-format card number as #### #### #### ####
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Auto-format expiry as MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length > 2) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  // Handle CVV (max 4 digits)
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(raw);
  };

  // UPI verification simulation
  const handleVerifyUpi = () => {
    setIsVerifyingUpi(true);
    setTimeout(() => {
      setIsVerifyingUpi(false);
      setIsUpiVerified(true);
      showToast('UPI VPA Verified with NPCI ✓', 'success');
    }, 500);
  };

  // Direct Payment & Subscription Confirmation
  const handleConfirmAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (paymentTab === 'card') {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        setErrorMessage('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setErrorMessage('Please enter a valid card expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMessage('Please enter a 3 or 4 digit CVV.');
        return;
      }
      if (!pinCode || pinCode.length !== 6) {
        setErrorMessage('Please enter a valid 6-digit postal PIN code.');
        return;
      }
    }

    if (paymentTab === 'upi' && (!upiId || !upiId.includes('@'))) {
      setErrorMessage('Please enter a valid UPI ID (e.g. rohan@okhdfcbank).');
      return;
    }

    try {
      setIsProcessing(true);

      let paymentMethodDesc = 'Credit / Debit Card';
      if (paymentTab === 'card') {
        const last4 = cardNumber.replace(/\s+/g, '').slice(-4) || '4242';
        paymentMethodDesc = `${currentBrand.name} Card (Ending in ${last4})`;
      } else if (paymentTab === 'upi') {
        paymentMethodDesc = `UPI (${upiId})`;
      } else {
        paymentMethodDesc = 'NetBanking (HDFC Bank Direct)';
      }

      const res = await api.subscriptions.subscribe(plan.id, paymentMethodDesc);
      if (res.success) {
        await refreshUser();
        
        // Calculate expiration display
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (plan.validityDays || 30));
        const formattedExpiry = expiryDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

        const txId = res.order?.transactionId || `TXN-MB-${Date.now().toString(36).toUpperCase()}`;

        setConfirmedOrder({
          transactionId: txId,
          orderId: res.order?.id,
          planName: plan.name,
          amount: plan.price,
          formattedPrice: plan.formattedPrice,
          paymentMethod: paymentMethodDesc,
          validUntil: formattedExpiry
        });

        setStep('confirmed');
        showToast(`Payment of ${plan.formattedPrice} authorized! Subscribed to ${plan.name}.`, 'success');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment confirmation failed. Please try again.');
      showToast(err.message || 'Payment confirmation failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinishAndStartWatching = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl cinema-glass rounded-2xl p-6 sm:p-8 border border-gold/30 shadow-modal-gold text-left my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold to-sapphire flex items-center justify-center text-black font-bold shadow-cinema-glow">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-cinema text-white flex items-center gap-2">
                {step === 'checkout' ? 'Subscription Gateway' : 'Order Confirmation'}
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  {step === 'checkout' ? 'PCI-DSS 4.0' : 'Confirmed'}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                {step === 'checkout' ? 'Review & confirm your instant cinema pass' : 'Your subscription is active and ready to stream'}
              </p>
            </div>
          </div>
          <button
            onClick={step === 'confirmed' ? handleFinishAndStartWatching : onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full bg-surface hover:bg-surface-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Direct Confirmation & Payment Review */}
        {step === 'checkout' && (
          <form onSubmit={handleConfirmAndPay} className="space-y-6 mt-5">
            {/* Plan Summary Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-surface-elevated to-surface-charcoal border border-gold/20 flex items-center justify-between shadow-inner">
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase tracking-wider text-gold font-bold block">Selected Cinema Tier</span>
                <span className="text-base font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-gold" />
                  {plan.name}
                </span>
                <span className="text-[11px] text-gray-400 block">
                  30 Days Unlimited • 4K Ultra HD • Dolby Atmos Audio
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-gray-400 block">Total Due</span>
                <span className="text-xl font-bold text-gold font-mono">{plan.formattedPrice}.00</span>
                <span className="text-[10px] text-emerald-400 block font-medium">Includes 18% GST</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-surface-charcoal border border-gray-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaymentTab('card')}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                  paymentTab === 'card'
                    ? 'bg-gold text-black shadow-cinema-glow font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('upi')}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                  paymentTab === 'upi'
                    ? 'bg-gold text-black shadow-cinema-glow font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                UPI (GPay / PhonePe)
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('netbanking')}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                  paymentTab === 'netbanking'
                    ? 'bg-gold text-black shadow-cinema-glow font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                NetBanking
              </button>
            </div>

            {/* CARD DETAILS TAB */}
            {paymentTab === 'card' && (
              <div className="space-y-4">
                {/* 3D Interactive Virtual Card Preview */}
                <div className="perspective-1000 w-full max-w-sm mx-auto h-48 select-none">
                  <div
                    className={`relative w-full h-full rounded-2xl p-6 shadow-2xl transition-transform duration-700 transform-style-3d border border-white/20 bg-gradient-to-br ${
                      currentBrand.color
                    } ${isCardFlipped ? 'rotate-y-180' : ''}`}
                  >
                    {/* Front Face */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between backface-hidden">
                      <div className="flex items-center justify-between">
                        {/* EMV Chip */}
                        <div className="w-10 h-7 rounded bg-gradient-to-tr from-amber-200 to-amber-400 shadow-inner flex items-center justify-center border border-amber-500/40">
                          <div className="w-7 h-5 border border-amber-600/40 rounded-sm" />
                        </div>
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded ${currentBrand.badge}`}>
                          {currentBrand.name}
                        </span>
                      </div>

                      {/* Card Number */}
                      <div className="font-mono text-lg sm:text-xl tracking-widest text-white drop-shadow font-bold">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>

                      {/* Cardholder & Expiry */}
                      <div className="flex items-center justify-between text-xs text-gray-200">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Cardholder</span>
                          <span className="font-semibold tracking-wide uppercase truncate block max-w-[170px]">
                            {cardHolder || 'ROHAN VERMA'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Expires</span>
                          <span className="font-mono font-semibold">{cardExpiry || 'MM/YY'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Back Face (when CVV focused) */}
                    <div className="absolute inset-0 rounded-2xl flex flex-col justify-between py-6 rotate-y-180 backface-hidden bg-slate-900 border border-white/10">
                      <div className="w-full h-10 bg-black mt-2" />
                      <div className="px-6 flex items-center justify-between">
                        <div className="w-44 h-8 bg-gray-200 rounded text-black font-mono text-xs italic flex items-center justify-end px-3">
                          Authorized Signature
                        </div>
                        <div className="bg-white text-black px-3 py-1 font-mono font-bold text-xs rounded border border-gray-400">
                          {cardCvv || '•••'}
                        </div>
                      </div>
                      <p className="px-6 text-[9px] text-gray-400 text-center font-mono">
                        Verified 256-Bit Encrypted Cinema Stream Gateway.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-300 font-semibold block mb-1">
                      16-Digit Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        onFocus={() => setIsCardFlipped(false)}
                        placeholder="4532 8920 1123 4242"
                        required
                        className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-gray-800 text-white font-mono text-sm focus:border-gold focus:outline-none"
                      />
                      <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-300 font-semibold block mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      onFocus={() => setIsCardFlipped(false)}
                      placeholder="Rohan Verma"
                      required
                      className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-gray-800 text-white text-sm focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-300 font-semibold block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        onFocus={() => setIsCardFlipped(false)}
                        placeholder="MM/YY"
                        required
                        className="w-full px-3 py-2.5 bg-surface rounded-xl border border-gray-800 text-white font-mono text-sm text-center focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-300 font-semibold block mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        onFocus={() => setIsCardFlipped(true)}
                        onBlur={() => setIsCardFlipped(false)}
                        placeholder="•••"
                        required
                        className="w-full px-3 py-2.5 bg-surface rounded-xl border border-gray-800 text-white font-mono text-sm text-center focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address Details */}
                <div className="pt-3 border-t border-gray-800 space-y-3">
                  <span className="text-xs uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Billing Address Details
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="Street Address / House No."
                        className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-white focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-white focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-white focus:border-gold focus:outline-none"
                      >
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Kerala">Kerala</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="PIN (6 digits)"
                        className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-white font-mono focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* UPI TAB */}
            {paymentTab === 'upi' && (
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-xs text-gray-300 font-semibold block mb-1">
                    Virtual Payment Address (VPA) / UPI ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        setIsUpiVerified(false);
                      }}
                      placeholder="username@okhdfcbank"
                      className="flex-1 px-3.5 py-2.5 bg-surface rounded-xl border border-gray-800 text-white font-mono text-sm focus:border-gold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyUpi}
                      className="px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-gray-700 text-xs font-semibold text-gold transition"
                    >
                      {isVerifyingUpi ? 'Verifying...' : isUpiVerified ? 'Verified ✓' : 'Verify'}
                    </button>
                  </div>
                </div>

                {isUpiVerified && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>UPI ID linked to Rohan Verma (HDFC Bank Ltd). Direct confirmation active.</span>
                  </div>
                )}
              </div>
            )}

            {/* NETBANKING TAB */}
            {paymentTab === 'netbanking' && (
              <div className="space-y-3 py-2">
                <label className="text-xs text-gray-300 font-semibold block">Select Your Bank</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((b, idx) => (
                    <div
                      key={b}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                        idx === 0
                          ? 'border-gold bg-gold/15 text-gold font-bold'
                          : 'border-gray-800 bg-surface text-gray-300'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Confirmation Action Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold via-gold to-sapphire text-black font-bold text-sm shadow-cinema-glow hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing Subscription ({plan.formattedPrice})...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirm Order & Pay {plan.formattedPrice}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: ORDER CONFIRMATION PAGE / RECEIPT */}
        {step === 'confirmed' && confirmedOrder && (
          <div className="space-y-6 mt-5 animate-fade-in text-center">
            
            {/* Success Icon */}
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <Sparkles className="w-5 h-5 text-gold absolute -top-1 -right-1 animate-pulse" />
            </div>

            <div>
              <h4 className="text-xl font-bold font-cinema text-white">Subscription Confirmed!</h4>
              <p className="text-xs text-gray-300 mt-1 max-w-sm mx-auto">
                Your payment has been successfully processed. Your cinema access is now fully active.
              </p>
            </div>

            {/* Order Receipt Summary Card */}
            <div className="p-5 rounded-xl bg-surface/90 border border-gold/30 text-left space-y-3 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-gold" />
                  <span className="text-xs font-semibold text-gray-300">Transaction Details</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  COMPLETED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Transaction Reference:</span>
                  <span className="text-white font-mono font-medium truncate block max-w-[200px]" title={confirmedOrder.transactionId}>
                    {confirmedOrder.transactionId}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-gray-400 block text-[11px]">Amount Paid:</span>
                  <span className="text-gold font-mono font-bold text-sm">
                    {confirmedOrder.formattedPrice}.00
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Plan Subscribed:</span>
                  <span className="text-white font-semibold flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-gold" />
                    {confirmedOrder.planName}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-gray-400 block text-[11px]">Valid Until:</span>
                  <span className="text-white font-medium flex items-center justify-end gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sapphire" />
                    {confirmedOrder.validUntil}
                  </span>
                </div>

                <div className="col-span-2 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Payment Rail:</span>
                  <span className="text-gray-200 font-mono">{confirmedOrder.paymentMethod}</span>
                </div>

                <div className="col-span-2 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Streaming Access:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Tv className="w-3.5 h-3.5" /> 4K UHD + Dolby Atmos Active
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleFinishAndStartWatching}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold via-gold to-sapphire text-black font-bold text-sm shadow-cinema-glow hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                <span>Start Watching Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
