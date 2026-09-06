import React, { useState, useRef, useEffect } from 'react';
import { TelecomNetwork, TelecomPackage, RetailerOrder, NetworkName } from '../types';
import { NETWORKS } from '../data/telecomData';
import { Zap, Check, ArrowRight, Shield, AlertCircle, Copy, Sparkles, RefreshCw } from 'lucide-react';

interface CustomerPortalProps {
  packages: TelecomPackage[];
  onOrderComplete: (order: RetailerOrder) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ packages, onOrderComplete }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [detectedNetwork, setDetectedNetwork] = useState<TelecomNetwork | null>(null);
  const [mode, setMode] = useState<'load' | 'package'>('load');
  const [selectedLoadAmount, setSelectedLoadAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<TelecomPackage | null>(null);
  const [packageCategory, setPackageCategory] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  
  // Checkout Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<'processing' | 'success'>('processing');
  const [activeTransaction, setActiveTransaction] = useState<RetailerOrder | null>(null);
  const [copiedTrx, setCopiedTrx] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Network Detection
  useEffect(() => {
    if (phoneNumber.length >= 4) {
      const prefix = phoneNumber.slice(1, 4); // prefix without leading 0
      const found = NETWORKS.find(n => n.prefixes.includes(prefix));
      setDetectedNetwork(found || null);
    } else {
      setDetectedNetwork(null);
    }
  }, [phoneNumber]);

  // Handle phone input formatting
  const handlePhoneChange = (val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 11);
    setPhoneNumber(numeric);
    // If selected package is from another network, reset it
    if (selectedPackage && detectedNetwork && selectedPackage.network !== detectedNetwork.name) {
      setSelectedPackage(null);
    }
  };

  // Preset demo numbers
  const setQuickDemoNumber = (num: string) => {
    setPhoneNumber(num);
    if (inputRef.current) inputRef.current.focus();
  };

  // Selected item calculations
  const getItemDetails = (): { title: string; price: number } | null => {
    if (mode === 'load') {
      if (customAmount && Number(customAmount) > 0) {
        return {
          title: `Mobile Load (₨${customAmount})`,
          price: Number(customAmount),
        };
      }
      if (selectedLoadAmount) {
        return {
          title: `Mobile Load (₨${selectedLoadAmount})`,
          price: selectedLoadAmount,
        };
      }
      return null;
    } else {
      if (selectedPackage) {
        return {
          title: `${selectedPackage.title} (${selectedPackage.validity})`,
          price: selectedPackage.price,
        };
      }
      return null;
    }
  };

  const selectedItem = getItemDetails();
  const isNumberComplete = phoneNumber.length === 11;
  const isFormReady = isNumberComplete && selectedItem !== null && selectedItem.price >= 30;

  // Filter packages for detected network
  const currentNetworkPackages = packages.filter(p => {
    if (!detectedNetwork) return true;
    return p.network === detectedNetwork.name;
  }).filter(p => {
    if (packageCategory === 'all') return true;
    return p.category === packageCategory;
  });

  // Start Payment
  const handleInitiatePayment = () => {
    if (!isFormReady || !selectedItem) return;

    const newTrxId = 'JC-' + Math.floor(10000000 + Math.random() * 90000000);
    const orderData: RetailerOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ', ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      number: phoneNumber.replace(/(\d{4})(\d{7})/, '$1 $2'),
      network: (detectedNetwork ? detectedNetwork.name : 'Unknown') as NetworkName,
      item: selectedItem.title,
      amount: selectedItem.price,
      status: 'ok',
      paymentMethod: 'JazzCash',
      trxId: newTrxId,
    };

    setActiveTransaction(orderData);
    setPaymentPhase('processing');
    setIsModalOpen(true);

    // Auto-progress simulation after 2.6s if user doesn't manually click
    const timer = setTimeout(() => {
      setPaymentPhase('success');
      onOrderComplete(orderData);
    }, 2800);

    return () => clearTimeout(timer);
  };

  const handleInstantApprove = () => {
    if (activeTransaction) {
      setPaymentPhase('success');
      onOrderComplete(activeTransaction);
    }
  };

  const handleResetForNewOrder = () => {
    setIsModalOpen(false);
    setPhoneNumber('');
    setSelectedPackage(null);
    setCustomAmount('');
    setSelectedLoadAmount(100);
    setPaymentPhase('processing');
  };

  const handleCopyTrx = () => {
    if (activeTransaction) {
      navigator.clipboard.writeText(activeTransaction.trxId);
      setCopiedTrx(true);
      setTimeout(() => setCopiedTrx(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-[580px] mx-auto pb-12">
      {/* Hero Terminal Card */}
      <div 
        id="terminal-main-card"
        className="relative bg-gradient-to-br from-[#1B1E3D] via-[#161933] to-[#13162C] border border-[#31356A] rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl overflow-hidden mb-8"
      >
        {/* Ambient glow accent */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#F2A93B] font-mono-code text-[11px] tracking-[3px] uppercase font-semibold">
              Core Terminal
            </p>
            <span className="text-[10px] font-mono-code text-[#6B7280] uppercase tracking-wider">
              PORT 3000 · ONLINE
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6 tracking-tight">
            Instant Sim Load <br />
            <span className="text-[#F2A93B] italic font-serif">&amp; Packages.</span>
          </h2>

          {/* Hero Recharge Card */}
          <div 
            id="recharge-phone-card"
            className="bg-[#ECE6D6] rounded-2xl p-5 sm:p-6 shadow-2xl text-[#181A2E] border border-white/60 mb-6 relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-mono-code uppercase tracking-widest text-[#5C5A4A] font-bold block">
                  Phone Number
                </span>
                <span className="text-[11px] text-[#6b6858]">11-Digit Prepaid / Postpaid</span>
              </div>

              {/* Dynamic Network Chip */}
              <div 
                id="network-detected-chip"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono-code font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-300 transform scale-100"
                style={{
                  backgroundColor: detectedNetwork ? detectedNetwork.color : '#6B7280',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>{detectedNetwork ? `${detectedNetwork.name} Detected` : (phoneNumber.length ? 'Not Recognized' : 'Detecting…')}</span>
              </div>
            </div>

            {/* Digit Row Representation */}
            <div 
              className="relative my-3 cursor-text group"
              onClick={() => inputRef.current?.focus()}
            >
              <div className="flex gap-1 sm:gap-2">
                {Array.from({ length: 11 }).map((_, idx) => {
                  const char = phoneNumber[idx];
                  const isFilled = Boolean(char);
                  const isCurrent = phoneNumber.length === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 h-12 sm:h-14 bg-white border border-[#D8D2BD] rounded-lg flex items-center justify-center font-mono-code text-xl sm:text-2xl font-bold text-[#181A2E] shadow-inner transition-all ${
                        isFilled 
                          ? 'border-[#8A6626] bg-[#FFF8EA] text-[#181A2E]' 
                          : isCurrent 
                            ? 'border-[#F2A93B] ring-2 ring-[#F2A93B]/40' 
                            : 'text-[#9A9BC0]'
                      }`}
                    >
                      {char || ''}
                    </div>
                  );
                })}
              </div>

              {/* Transparent Input capturing keystrokes */}
              <input
                id="mobile-phone-input"
                ref={inputRef}
                type="tel"
                inputMode="numeric"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                maxLength={11}
                autoComplete="off"
                className="absolute inset-0 w-full h-full opacity-0 cursor-text z-20"
                placeholder="03XXXXXXXXX"
              />
            </div>

            {/* Input helpers & quick presets */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6b6858] pt-2 border-t border-[#D8D2BD]/60">
              <p className="text-[10px] text-[#8B8B8B] italic">
                {detectedNetwork ? `Verification active for ${detectedNetwork.name} cellular network.` : 'e.g. 03XXXXXXXXX — network apne aap detect hoga.'}
              </p>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-mono-code text-[#7c7764] font-semibold">Test:</span>
                <button
                  type="button"
                  onClick={() => setQuickDemoNumber('03012345678')}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-[#FFFDF6] text-[10px] font-mono-code font-bold text-[#ED1C24] border border-[#d8d2bd] shadow-2xs"
                >
                  Jazz
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDemoNumber('03119876543')}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-[#FFFDF6] text-[10px] font-mono-code font-bold text-[#8A2BA8] border border-[#d8d2bd] shadow-2xs"
                >
                  Zong
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDemoNumber('03335551234')}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-[#FFFDF6] text-[10px] font-mono-code font-bold text-[#F26522] border border-[#d8d2bd] shadow-2xs"
                >
                  Ufone
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDemoNumber('03457788990')}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-[#FFFDF6] text-[10px] font-mono-code font-bold text-[#00A0DF] border border-[#d8d2bd] shadow-2xs"
                >
                  Telenor
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 1: Choose Mode & Package/Load */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#9A9BC0] text-[10px] font-mono-code uppercase tracking-widest font-semibold">
                Select Load or Bundle
              </span>
              <div className="flex bg-[#0A0C16] border border-[#242945] rounded-xl p-1 gap-1">
                <button
                  id="mode-load-toggle"
                  type="button"
                  onClick={() => {
                    setMode('load');
                    setSelectedPackage(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'load'
                      ? 'bg-[#F2A93B] text-[#0A0C16]'
                      : 'text-[#9A9BC0] hover:text-white'
                  }`}
                >
                  Mobile Load
                </button>
                <button
                  id="mode-package-toggle"
                  type="button"
                  onClick={() => {
                    setMode('package');
                    setSelectedLoadAmount(null);
                    setCustomAmount('');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'package'
                      ? 'bg-[#F2A93B] text-[#0A0C16]'
                      : 'text-[#9A9BC0] hover:text-white'
                  }`}
                >
                  Packages
                </button>
              </div>
            </div>

            {/* LOAD MODE CONTENT */}
            {mode === 'load' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[50, 100, 200, 500, 1000].map((amt) => {
                    const isSelected = selectedLoadAmount === amt && !customAmount;
                    return (
                      <div
                        key={amt}
                        onClick={() => {
                          setSelectedLoadAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`bg-[#13162C] border rounded-xl p-3 sm:p-3.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#F2A93B] bg-[#1B1E3D] shadow-[0_0_15px_rgba(242,169,59,0.25)]'
                            : 'border-[#31356A] hover:border-[#F2A93B]/60'
                        }`}
                      >
                        <p className={`font-mono-code text-base sm:text-lg font-bold ${isSelected ? 'text-[#F2A93B]' : 'text-white'}`}>
                          ₨ {amt}
                        </p>
                        <p className="text-[10px] text-[#9A9BC0] uppercase mt-0.5 tracking-wider">
                          {amt >= 500 ? 'Super Recharge' : 'Standard Load'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Amount Box */}
                <div className="bg-[#0A0C16] border border-[#242945] rounded-xl p-3 flex items-center gap-3 focus-within:border-[#F2A93B] transition-colors">
                  <span className="font-mono-code font-bold text-[#F2A93B] text-base pl-1">₨</span>
                  <input
                    id="custom-load-amount"
                    type="number"
                    min="30"
                    max="10000"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedLoadAmount(null);
                    }}
                    placeholder="Custom amount likhein (e.g. 150, 750)"
                    className="bg-transparent border-0 outline-none w-full text-xs sm:text-sm font-mono-code text-[#E0E2F0] placeholder:text-[#6B7280]"
                  />
                  {customAmount && (
                    <button 
                      type="button" 
                      onClick={() => setCustomAmount('')}
                      className="text-xs text-[#9A9BC0] hover:text-white px-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* PACKAGE MODE CONTENT */}
            {mode === 'package' && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {(['all', 'daily', 'weekly', 'monthly'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPackageCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono-code uppercase transition-all whitespace-nowrap ${
                        packageCategory === cat
                          ? 'bg-[#1B1E3D] text-[#F2A93B] border border-[#F2A93B]'
                          : 'bg-[#0A0C16] text-[#9A9BC0] border border-[#242945] hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? 'All Bundles' : `${cat} Packages`}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentNetworkPackages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`cursor-pointer rounded-xl p-3.5 border transition-all text-left relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#1B1E3D] border-[#F2A93B] shadow-[0_0_14px_rgba(242,169,59,0.25)] ring-1 ring-[#F2A93B]'
                            : 'bg-[#13162C] border-[#242945] hover:border-[#31356A]'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-[#0A0C16] text-[#9A9BC0] border border-[#242945]">
                              {pkg.network} · {pkg.validity}
                            </span>
                            <span className="font-mono-code font-bold text-sm sm:text-base text-[#F2A93B]">
                              ₨{pkg.price}
                            </span>
                          </div>
                          <h4 className="font-display font-semibold text-xs sm:text-sm text-white leading-snug">
                            {pkg.title}
                          </h4>
                          <p className="text-[11px] text-[#9A9BC0] mt-1 line-clamp-2">
                            {pkg.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#242945] flex items-center justify-between text-[11px]">
                          <span className={`font-mono-code ${isSelected ? 'text-[#3FBF7F] font-bold' : 'text-[#6B7280]'}`}>
                            {isSelected ? '✓ Selected' : 'Tap to select'}
                          </span>
                          <span className="text-[10px] text-[#F2A93B] uppercase tracking-wider">
                            Instant Active
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ORDER SUMMARY STRIP */}
          <div className="bg-[#0A0C16] border border-[#242945] rounded-2xl p-4 sm:p-5 mb-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#242945] text-xs">
              <span className="text-[#9A9BC0]">Selected Item</span>
              <span className="font-semibold text-white truncate max-w-[220px]">
                {selectedItem ? selectedItem.title : '— (Select load or package)'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <div>
                <span className="text-[10px] font-mono-code uppercase tracking-wider text-[#6B7280] block">
                  Total Payable (JazzCash)
                </span>
                <span className="text-[10px] text-[#3FBF7F] font-mono-code">Zero Merchant Surcharge</span>
              </div>
              <span className="font-serif font-bold italic text-2xl sm:text-3xl text-[#F2A93B]">
                ₨ {selectedItem ? selectedItem.price : 0}
              </span>
            </div>
          </div>

          {/* JazzCash Checkout Button */}
          <button
            id="jazzcash-checkout-btn"
            type="button"
            disabled={!isFormReady}
            onClick={handleInitiatePayment}
            className={`w-full h-14 sm:h-16 rounded-2xl font-display font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all ${
              isFormReady
                ? 'bg-gradient-to-r from-[#E4002B] via-[#C90025] to-[#B8001F] text-white shadow-xl shadow-red-900/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                : 'bg-[#13162C] text-[#6B7280] border border-[#242945] cursor-not-allowed opacity-60'
            }`}
          >
            <span>Process via JazzCash</span>
            <span className="bg-white text-[#E4002B] text-[10px] font-mono-code font-extrabold px-2 py-0.5 rounded shadow-sm">
              JC
            </span>
          </button>
        </div>
      </div>

      {/* CHECKOUT MODAL OVERLAY */}
      {isModalOpen && (
        <div 
          id="checkout-modal-overlay"
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div 
            className="w-full max-w-[480px] bg-[#13162C] border border-[#242945] rounded-t-3xl sm:rounded-2xl p-6 sm:p-7 shadow-2xl text-[#E0E2F0] animate-in slide-in-from-bottom duration-300"
          >
            {paymentPhase === 'processing' ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-xl bg-[#E4002B]/20 text-[#E4002B] flex items-center justify-center mx-auto mb-3 border border-[#E4002B]/40">
                  <span className="font-mono-code font-bold text-sm">JC</span>
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-1">
                  JazzCash se payment ho rahi hai
                </h3>
                <p className="text-xs text-[#9A9BC0] mb-5 max-w-sm mx-auto">
                  Braah-e-karam apna JazzCash mobile account par mila hua confirmation code ya MPIN approve karein.
                </p>

                {/* Animated 4-signal bars */}
                <div className="flex items-end justify-center gap-1.5 h-9 my-4">
                  <div className="w-2 rounded-full bg-[#F2A93B] h-1/3 animate-bar-1" />
                  <div className="w-2 rounded-full bg-[#F2A93B] h-3/5 animate-bar-2" />
                  <div className="w-2 rounded-full bg-[#F2A93B] h-4/5 animate-bar-3" />
                  <div className="w-2 rounded-full bg-[#F2A93B] h-full animate-bar-4" />
                </div>

                {/* Transaction summary card */}
                <div className="bg-[#0A0C16] border border-[#242945] rounded-xl p-4 text-left my-5 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#9A9BC0]">Merchant</span>
                    <span className="font-semibold text-white">Tanzeem Retailer (Verified)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9A9BC0]">Mobile Number</span>
                    <span className="font-mono-code text-white">{activeTransaction?.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9A9BC0]">Amount</span>
                    <span className="font-mono-code font-bold text-[#F2A93B] text-sm">₨{activeTransaction?.amount}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#242945]">
                    <span className="text-[#9A9BC0]">Status</span>
                    <span className="text-[#F2A93B] font-mono-code font-semibold flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Waiting for approval…
                    </span>
                  </div>
                </div>

                {/* Instant Simulation Action */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleInstantApprove}
                    className="w-full py-3 rounded-xl bg-[#3FBF7F] hover:bg-[#34a86e] text-[#0A0C16] font-display font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Approve MPIN (Instant Simulator)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-2 text-xs text-[#6B7280] hover:text-white"
                  >
                    Cancel Transaction
                  </button>
                </div>
              </div>
            ) : (
              /* SUCCESS RECEIPT PHASE */
              <div className="py-2 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#173328] text-[#3FBF7F] border border-[#1E4D37] flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(63,191,127,0.3)]">
                  <Check className="w-7 h-7 stroke-[2.5]" />
                </div>
                <h3 className="font-display font-bold text-2xl text-white mb-1">
                  Load bhej diya gaya ✅
                </h3>
                <p className="text-xs text-[#9A9BC0] mb-4">
                  Payment confirm ho gayi — order telecom network ko deliver kar diya gaya hai.
                </p>

                {/* Official Receipt Card */}
                <div className="bg-[#0A0C16] border border-[#242945] rounded-xl p-4 text-left my-4 text-xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9A9BC0]">Transaction ID</span>
                    <div className="flex items-center gap-1 font-mono-code font-bold text-[#F2A93B]">
                      <span>{activeTransaction?.trxId}</span>
                      <button 
                        type="button" 
                        onClick={handleCopyTrx} 
                        className="p-1 hover:bg-[#1B1E3D] rounded text-[#9A9BC0] hover:text-white"
                        title="Copy Trx ID"
                      >
                        {copiedTrx ? <Check className="w-3.5 h-3.5 text-[#3FBF7F]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9A9BC0]">Phone Number</span>
                    <span className="font-mono-code font-semibold text-white">{activeTransaction?.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9A9BC0]">Telecom Network</span>
                    <span className="font-semibold text-white">{activeTransaction?.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9A9BC0]">Package / Item</span>
                    <span className="font-medium text-white">{activeTransaction?.item}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9A9BC0]">Paid Amount</span>
                    <span className="font-mono-code font-bold text-[#3FBF7F]">₨{activeTransaction?.amount}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#242945]">
                    <span className="text-[#9A9BC0]">Delivery Status</span>
                    <span className="font-mono-code font-bold text-[#3FBF7F] bg-[#173328] px-2.5 py-0.5 rounded-full border border-[#1E4D37] text-[10px] uppercase">
                      Delivered
                    </span>
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="space-y-2">
                  <button
                    id="modal-success-done-btn"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-3.5 rounded-xl bg-[#F2A93B] hover:bg-[#d9952f] text-[#0A0C16] font-display font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    Theek hai (Done)
                  </button>
                  <button
                    id="modal-success-new-order-btn"
                    type="button"
                    onClick={handleResetForNewOrder}
                    className="w-full py-2.5 rounded-xl border border-[#242945] hover:bg-[#1B1E3D] text-xs text-[#E0E2F0] font-medium transition-all"
                  >
                    Naya Order Karein
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
