/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminPortal } from './components/AdminPortal';
import { INITIAL_PACKAGES, INITIAL_ORDERS } from './data/telecomData';
import { RetailerOrder, TelecomPackage } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');

  // Persistent Orders
  const [orders, setOrders] = useState<RetailerOrder[]>(() => {
    try {
      const saved = localStorage.getItem('tanzeem_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_ORDERS;
  });

  // Persistent Packages & Pricing
  const [packages, setPackages] = useState<TelecomPackage[]>(() => {
    try {
      const saved = localStorage.getItem('tanzeem_packages');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_PACKAGES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tanzeem_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('tanzeem_packages', JSON.stringify(packages));
    } catch (e) {
      console.error(e);
    }
  }, [packages]);

  // Handler to record customer completed orders
  const handleOrderComplete = (newOrder: RetailerOrder) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  // Handler to update status (Admin)
  const handleUpdateOrderStatus = (orderId: string, newStatus: 'ok' | 'pending' | 'failed') => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  // Handler to update package price (Admin)
  const handleUpdatePackagePrice = (packageId: string, newPrice: number) => {
    setPackages(prev =>
      prev.map(pkg => (pkg.id === packageId ? { ...pkg, price: newPrice } : pkg))
    );
  };

  // Handler to add new package (Admin)
  const handleAddNewPackage = (newPkg: TelecomPackage) => {
    setPackages(prev => [newPkg, ...prev]);
  };

  // Handler to inject simulated test order (Admin)
  const handleAddSimulatedOrder = (order: RetailerOrder) => {
    setOrders(prev => [order, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0A0C16] text-[#E0E2F0] font-body relative overflow-x-hidden selection:bg-[#F2A93B]/30 selection:text-white">
      {/* Background ambient lighting */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: `
            radial-gradient(1000px 500px at 20% -5%, #1B1E3D80 0%, transparent 60%),
            radial-gradient(800px 400px at 100% 10%, #2A1F4060 0%, transparent 55%),
            radial-gradient(700px 350px at 50% 100%, #16193370 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative z-10 max-w-[680px] mx-auto px-4 sm:px-6 pt-4 pb-12">
        {/* Navigation bar with view switcher and JazzCash status */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          orderCount={orders.length}
        />

        {/* Main Interactive Views */}
        <main>
          {activeTab === 'customer' ? (
            <CustomerPortal
              packages={packages}
              onOrderComplete={handleOrderComplete}
            />
          ) : (
            <AdminPortal
              orders={orders}
              packages={packages}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdatePackagePrice={handleUpdatePackagePrice}
              onAddNewPackage={handleAddNewPackage}
              onAddSimulatedOrder={handleAddSimulatedOrder}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="mt-12 pt-6 border-t border-[#242945] text-center text-xs text-[#9A9BC0] space-y-1.5">
          <div className="flex items-center justify-center gap-2 font-display font-semibold text-[#E0E2F0]">
            <span>Tanzeem Retailer Network</span>
            <span className="text-[#F2A93B]">·</span>
            <span>JazzCash Verified Merchant</span>
          </div>
          <p className="text-[11px] font-mono-code text-[#6B7280]">
            Jazz • Zong • Ufone • Telenor — Automatic Network Detection &amp; Instant Recharge
          </p>
        </footer>
      </div>
    </div>
  );
}
