import React from 'react';
import { Smartphone, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'customer' | 'admin';
  setActiveTab: (tab: 'customer' | 'admin') => void;
  orderCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, orderCount }) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:px-6 bg-[#0F1221] border-b border-[#242945] rounded-2xl shadow-xl shadow-black/40 mb-6">
      <div className="flex items-center gap-3.5">
        <div 
          id="brand-mark-logo"
          className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F2A93B] to-[#B5761F] flex items-center justify-center font-display font-bold text-[#0A0C16] text-xl shadow-lg shadow-orange-900/20 cursor-pointer transition-transform hover:scale-105"
          onClick={() => setActiveTab('customer')}
        >
          TR
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-lg tracking-tight text-[#E0E2F0]">
              Tanzeem <span className="text-[#F2A93B]">Retailer</span>
            </h1>
            <span className="hidden xs:inline-block text-[10px] font-mono-code bg-[#13162C] text-[#6B7280] px-2 py-0.5 rounded-md border border-[#242945] uppercase tracking-wider font-semibold">
              Enterprise
            </span>
          </div>
          <p className="text-[11px] uppercase tracking-widest text-[#6B7280] font-semibold hidden sm:block">Command Center &amp; Telecom Gateway</p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {/* Merchant ID display */}
        <div className="hidden md:block text-right pr-2 border-r border-[#242945]">
          <p className="text-[10px] text-[#9A9BC0] font-mono-code uppercase tracking-wider">Merchant ID</p>
          <p className="text-xs font-bold text-white font-mono-code">8821-TK-90</p>
        </div>

        {/* Active Status Pill */}
        <div 
          id="jazzcash-status-indicator"
          className="font-mono-code text-[11px] text-[#3FBF7F] border border-[#1E4D37] bg-[#173328] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm font-bold uppercase tracking-wider"
        >
          <span className="w-2 h-2 rounded-full bg-[#3FBF7F] animate-pulse shadow-[0_0_8px_#3FBF7F]"></span>
          <span>JazzCash Linked</span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-[#13162C] border border-[#242945] rounded-xl p-1 gap-1 text-xs">
          <button
            id="nav-customer-tab"
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
              activeTab === 'customer'
                ? 'bg-[#F2A93B] text-[#0A0C16] font-bold shadow-sm'
                : 'text-[#9A9BC0] hover:text-[#E0E2F0] hover:bg-[#1B1E3D]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Customer Recharge</span>
          </button>
          
          <button
            id="nav-admin-tab"
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium relative ${
              activeTab === 'admin'
                ? 'bg-[#F2A93B] text-[#0A0C16] font-bold shadow-sm'
                : 'text-[#9A9BC0] hover:text-[#E0E2F0] hover:bg-[#1B1E3D]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
            {orderCount > 0 && (
              <span className={`text-[10px] font-mono-code px-1.5 py-0.2 rounded-full ${
                activeTab === 'admin' ? 'bg-[#0A0C16] text-[#F2A93B]' : 'bg-[#1B1E3D] text-[#E0E2F0]'
              }`}>
                {orderCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
