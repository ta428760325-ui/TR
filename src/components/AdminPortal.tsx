import React, { useState } from 'react';
import { RetailerOrder, TelecomPackage, NetworkName } from '../types';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Search, 
  Check, 
  Clock, 
  AlertCircle, 
  Plus, 
  Download, 
  Sparkles,
  Edit2
} from 'lucide-react';

interface AdminPortalProps {
  orders: RetailerOrder[];
  packages: TelecomPackage[];
  onUpdateOrderStatus: (orderId: string, newStatus: 'ok' | 'pending' | 'failed') => void;
  onUpdatePackagePrice: (packageId: string, newPrice: number) => void;
  onAddNewPackage: (newPkg: TelecomPackage) => void;
  onAddSimulatedOrder: (order: RetailerOrder) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  orders,
  packages,
  onUpdateOrderStatus,
  onUpdatePackagePrice,
  onAddNewPackage,
  onAddSimulatedOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'pending' | 'failed'>('all');
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [savedPricingStatus, setSavedPricingStatus] = useState(false);
  const [localPrices, setLocalPrices] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    packages.forEach(p => {
      map[p.id] = p.price;
    });
    return map;
  });

  // New package modal/form state
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);
  const [newPkgNetwork, setNewPkgNetwork] = useState<NetworkName>('Jazz');
  const [newPkgTitle, setNewPkgTitle] = useState('');
  const [newPkgDesc, setNewPkgDesc] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('150');
  const [newPkgValidity, setNewPkgValidity] = useState('7 din');
  const [newPkgCategory, setNewPkgCategory] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Stats calculation
  const totalSales = orders.reduce((sum, o) => sum + (o.status === 'ok' ? o.amount : 0), 0);
  const totalOrdersCount = orders.length;
  const deliveredCount = orders.filter(o => o.status === 'ok').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.trxId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesNetwork = networkFilter === 'all' || order.network === networkFilter;
    return matchesSearch && matchesStatus && matchesNetwork;
  });

  const handlePriceChange = (id: string, val: string) => {
    const num = Number(val) || 0;
    setLocalPrices(prev => ({ ...prev, [id]: num }));
  };

  const handleSaveAllPricing = () => {
    Object.entries(localPrices).forEach(([pkgId, newPrice]) => {
      onUpdatePackagePrice(pkgId, newPrice);
    });
    setSavedPricingStatus(true);
    setTimeout(() => setSavedPricingStatus(false), 2000);
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgTitle || !newPkgPrice) return;

    const newPackage: TelecomPackage = {
      id: 'pkg-' + Date.now(),
      network: newPkgNetwork,
      title: newPkgTitle,
      description: newPkgDesc || `${newPkgTitle} bundle offer`,
      price: Number(newPkgPrice) || 100,
      validity: newPkgValidity,
      category: newPkgCategory,
    };

    onAddNewPackage(newPackage);
    setLocalPrices(prev => ({ ...prev, [newPackage.id]: newPackage.price }));
    setIsAddPackageOpen(false);
    setNewPkgTitle('');
    setNewPkgDesc('');
  };

  const handleInjectDemoOrder = () => {
    const randomNetworks: NetworkName[] = ['Jazz', 'Zong', 'Ufone', 'Telenor'];
    const selectedNet = randomNetworks[Math.floor(Math.random() * randomNetworks.length)];
    const prefixes = {
      Jazz: '0302',
      Zong: '0315',
      Ufone: '0334',
      Telenor: '0346',
      Unknown: '0300',
    };
    const randomNum = `${prefixes[selectedNet]} ${Math.floor(1000000 + Math.random() * 9000000)}`;
    const randomAmounts = [50, 100, 210, 350, 950, 1000];
    const amount = randomAmounts[Math.floor(Math.random() * randomAmounts.length)];
    const items = [
      'Mobile Load (Direct)',
      'Monthly Super Card',
      'Weekly Haftawar Max',
      'Daily 4G Combo',
    ];
    const item = items[Math.floor(Math.random() * items.length)];

    const simulatedOrder: RetailerOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: 'Just now (' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')',
      number: randomNum,
      network: selectedNet,
      item,
      amount,
      status: Math.random() > 0.15 ? 'ok' : 'pending',
      paymentMethod: 'JazzCash',
      trxId: 'JC-' + Math.floor(10000000 + Math.random() * 90000000),
    };

    onAddSimulatedOrder(simulatedOrder);
  };

  const handleExportCSV = () => {
    const headers = ['Order ID,Time,Number,Network,Item,Amount,Status,Trx ID,Payment Method'];
    const rows = orders.map(o => 
      `"${o.id}","${o.createdAt}","${o.number}","${o.network}","${o.item}",${o.amount},"${o.status}","${o.trxId}","${o.paymentMethod}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tanzeem-retailer-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-[620px] mx-auto pb-16">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 p-4 bg-[#0F1221] border border-[#242945] rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F2A93B]" />
            <h2 className="font-display font-bold text-xl text-white">
              Retailer Admin Dashboard
            </h2>
          </div>
          <p className="text-xs text-[#9A9BC0] mt-0.5">
            Dukan / Khata management, live transaction monitoring &amp; bundle pricing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInjectDemoOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B1E3D] hover:bg-[#242945] text-xs font-semibold text-[#F2A93B] border border-[#242945] transition-all cursor-pointer shadow-sm"
            title="Inject a realistic incoming order"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Test Order</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#13162C] hover:bg-[#1B1E3D] text-xs font-medium text-[#E0E2F0] border border-[#242945] transition-all"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5 text-[#9A9BC0]" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* STATS TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-[#13162C] border border-[#242945] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[11px] text-[#9A9BC0] uppercase tracking-wider">
              TODAY'S ORDERS
            </span>
            <ShoppingBag className="w-4 h-4 text-[#9A9BC0]" />
          </div>
          <div className="font-display font-bold text-2xl text-white mt-2">
            {totalOrdersCount}
          </div>
          <span className="text-[10px] text-[#3FBF7F] font-mono-code mt-1 flex items-center gap-1">
            <Check className="w-3 h-3" /> {deliveredCount} delivered
          </span>
        </div>

        <div className="bg-[#13162C] border border-[#242945] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[11px] text-[#9A9BC0] uppercase tracking-wider">
              TODAY'S SALES
            </span>
            <DollarSign className="w-4 h-4 text-[#F2A93B]" />
          </div>
          <div className="font-display font-bold text-2xl text-[#F2A93B] mt-2">
            ₨{totalSales.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#9A9BC0] font-mono-code mt-1">
            JazzCash Merchant
          </span>
        </div>

        <div className="bg-[#13162C] border border-[#242945] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[11px] text-[#9A9BC0] uppercase tracking-wider">
              SUCCESS RATE
            </span>
            <TrendingUp className="w-4 h-4 text-[#3FBF7F]" />
          </div>
          <div className="font-display font-bold text-2xl text-[#3FBF7F] mt-2">
            {totalOrdersCount ? Math.round((deliveredCount / totalOrdersCount) * 100) : 100}%
          </div>
          <span className="text-[10px] text-[#9A9BC0] font-mono-code mt-1">
            {pendingCount} Pending queues
          </span>
        </div>

        <div className="bg-[#13162C] border border-[#242945] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[11px] text-[#9A9BC0] uppercase tracking-wider">
              ACTIVE PLANS
            </span>
            <Edit2 className="w-4 h-4 text-[#9A9BC0]" />
          </div>
          <div className="font-display font-bold text-2xl text-white mt-2">
            {packages.length}
          </div>
          <span className="text-[10px] text-[#9A9BC0] font-mono-code mt-1">
            4 Networks active
          </span>
        </div>
      </div>

      {/* SECTION: Recent Transactions */}
      <section className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-display font-bold text-lg text-white">
            Recent Transactions
          </h3>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-44">
              <Search className="w-3.5 h-3.5 text-[#9A9BC0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search number/item…"
                className="w-full bg-[#13162C] border border-[#242945] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#E0E2F0] placeholder:text-[#6B7280] outline-none focus:border-[#F2A93B]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#13162C] border border-[#242945] rounded-xl px-2.5 py-1.5 text-xs text-[#E0E2F0] outline-none"
            >
              <option value="all">All Status</option>
              <option value="ok">Delivered (OK)</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="bg-[#13162C] border border-[#242945] rounded-xl px-2.5 py-1.5 text-xs text-[#E0E2F0] outline-none"
            >
              <option value="all">All Networks</option>
              <option value="Jazz">Jazz</option>
              <option value="Zong">Zong</option>
              <option value="Ufone">Ufone</option>
              <option value="Telenor">Telenor</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-[#13162C] border border-[#242945] rounded-2xl overflow-hidden shadow-md">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#9A9BC0]">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-[#9A9BC0]/60" />
              <p>Abhi tak koi transaction nahi mili.</p>
              <p className="mt-1 text-[11px]">Customer page se test order bhejein ya upar "+ Test Order" dabayein.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A0C16] text-[#9A9BC0] font-mono-code text-[10.5px] uppercase tracking-wider border-b border-[#242945]">
                    <th className="py-2.5 px-3.5">Number</th>
                    <th className="py-2.5 px-3">Network</th>
                    <th className="py-2.5 px-3">Item / Bundle</th>
                    <th className="py-2.5 px-3 text-right">Amt</th>
                    <th className="py-2.5 px-3.5 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242945] text-xs">
                  {filteredOrders.map((ord) => {
                    const isOk = ord.status === 'ok';
                    const isPending = ord.status === 'pending';
                    return (
                      <tr key={ord.id} className="hover:bg-[#1B1E3D]/40 transition-colors">
                        <td className="py-3 px-3.5 font-mono-code font-semibold text-white whitespace-nowrap">
                          {ord.number}
                          <div className="text-[10px] font-mono-code text-[#6B7280] font-normal">{ord.trxId}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-medium text-[#E0E2F0]">{ord.network}</span>
                        </td>
                        <td className="py-3 px-3 max-w-[160px] truncate text-[#E0E2F0]" title={ord.item}>
                          {ord.item}
                        </td>
                        <td className="py-3 px-3 font-mono-code font-bold text-[#F2A93B] text-right whitespace-nowrap">
                          ₨{ord.amount}
                        </td>
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <span 
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono-code font-semibold ${
                              isOk 
                                ? 'bg-[#173328] text-[#3FBF7F] border border-[#1E4D37]' 
                                : isPending 
                                  ? 'bg-[#3a2f12] text-[#F2A93B] border border-[#8A6626]' 
                                  : 'bg-[#3d1a20] text-[#E4536B] border border-[#7a2835]'
                            }`}
                          >
                            {isOk && <Check className="w-3 h-3" />}
                            {isPending && <Clock className="w-3 h-3" />}
                            {isOk ? 'Delivered' : isPending ? 'Pending' : 'Failed'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(ord.id, isOk ? 'pending' : 'ok')}
                            className="text-[11px] font-mono-code text-[#9A9BC0] hover:text-[#F2A93B] underline hover:no-underline"
                            title="Toggle order delivery status"
                          >
                            {isOk ? 'Mark Pending' : 'Mark Delivered'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* SECTION: Package Pricing Management */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              Pricing &amp; Bundles Manager
            </h3>
            <p className="text-xs text-[#9A9BC0]">
              Retail rates &amp; customer package pricing
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddPackageOpen(!isAddPackageOpen)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1B1E3D] hover:bg-[#242945] text-xs font-semibold text-[#E0E2F0] border border-[#242945] transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#F2A93B]" />
            <span>Naya Package Add Karein</span>
          </button>
        </div>

        {/* Add Package Sub-form */}
        {isAddPackageOpen && (
          <form 
            onSubmit={handleCreatePackage}
            className="bg-[#1B1E3D] border border-[#F2A93B]/40 rounded-2xl p-4 mb-4 text-xs space-y-3 animate-in fade-in duration-200"
          >
            <h4 className="font-display font-semibold text-sm text-[#F2A93B]">
              Add New Custom Telecom Package
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#9A9BC0] mb-1 font-mono-code">Network</label>
                <select
                  value={newPkgNetwork}
                  onChange={(e) => setNewPkgNetwork(e.target.value as NetworkName)}
                  className="w-full bg-[#0A0C16] border border-[#242945] rounded-lg p-2 text-[#E0E2F0]"
                >
                  <option value="Jazz">Jazz</option>
                  <option value="Zong">Zong</option>
                  <option value="Ufone">Ufone</option>
                  <option value="Telenor">Telenor</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#9A9BC0] mb-1 font-mono-code">Category</label>
                <select
                  value={newPkgCategory}
                  onChange={(e) => setNewPkgCategory(e.target.value as any)}
                  className="w-full bg-[#0A0C16] border border-[#242945] rounded-lg p-2 text-[#E0E2F0]"
                >
                  <option value="daily">Daily (1 Day)</option>
                  <option value="weekly">Weekly (7 Days)</option>
                  <option value="monthly">Monthly (30 Days)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#9A9BC0] mb-1 font-mono-code">Price (₨)</label>
                <input
                  type="number"
                  required
                  value={newPkgPrice}
                  onChange={(e) => setNewPkgPrice(e.target.value)}
                  className="w-full bg-[#0A0C16] border border-[#242945] rounded-lg p-2 text-[#E0E2F0] font-mono-code"
                  placeholder="e.g. 250"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#9A9BC0] mb-1 font-mono-code">Package Title</label>
                <input
                  type="text"
                  required
                  value={newPkgTitle}
                  onChange={(e) => setNewPkgTitle(e.target.value)}
                  className="w-full bg-[#0A0C16] border border-[#242945] rounded-lg p-2 text-[#E0E2F0]"
                  placeholder="e.g. Weekly Supreme Max"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#9A9BC0] mb-1 font-mono-code">Validity Text</label>
                <input
                  type="text"
                  value={newPkgValidity}
                  onChange={(e) => setNewPkgValidity(e.target.value)}
                  className="w-full bg-[#0A0C16] border border-[#242945] rounded-lg p-2 text-[#E0E2F0]"
                  placeholder="e.g. 7 din"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#9A9BC0] mb-1 font-mono-code">Description / Quota</label>
              <input
                type="text"
                value={newPkgDesc}
                onChange={(e) => setNewPkgDesc(e.target.value)}
                className="w-full bg-[#0A0C16] border border-[#242945] rounded-lg p-2 text-[#E0E2F0]"
                placeholder="e.g. 3000 On-net min, 300 Off-net, 10GB Data"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddPackageOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-[#242945] text-[#9A9BC0] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#F2A93B] text-[#0A0C16] font-bold"
              >
                Package Save Karein
              </button>
            </div>
          </form>
        )}

        {/* Pricing List Table/Rows */}
        <div className="space-y-2">
          {packages.map((pkg) => {
            const currentPrice = localPrices[pkg.id] ?? pkg.price;
            return (
              <div
                key={pkg.id}
                className="flex items-center justify-between bg-[#13162C] border border-[#242945] rounded-xl p-3 hover:border-[#F2A93B]/40 transition-colors"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono-code px-1.5 py-0.2 rounded bg-[#0A0C16] text-[#9A9BC0] border border-[#242945]">
                      {pkg.network}
                    </span>
                    <span className="font-semibold text-xs text-white">{pkg.title}</span>
                  </div>
                  <p className="text-[11px] text-[#9A9BC0] mt-0.5">{pkg.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-mono-code text-[#9A9BC0]">₨</span>
                  <input
                    type="number"
                    value={currentPrice}
                    onChange={(e) => handlePriceChange(pkg.id, e.target.value)}
                    className="w-20 bg-[#0A0C16] border border-[#242945] rounded-lg px-2.5 py-1.5 text-xs text-right font-mono-code font-bold text-[#F2A93B] focus:border-[#F2A93B] outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Pricing CTA Button */}
        <button
          id="save-pricing-btn"
          type="button"
          onClick={handleSaveAllPricing}
          className="w-full mt-4 py-3.5 px-4 rounded-xl bg-[#F2A93B] hover:bg-[#d9952f] text-[#0A0C16] font-display font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {savedPricingStatus ? (
            <>
              <Check className="w-4 h-4 text-[#0A0C16]" />
              <span>Pricing Saved Successfully ✓</span>
            </>
          ) : (
            <span>Pricing Save Karein</span>
          )}
        </button>
      </section>
    </div>
  );
};
