export type NetworkName = 'Jazz' | 'Zong' | 'Ufone' | 'Telenor' | 'Unknown';

export interface TelecomNetwork {
  name: NetworkName;
  color: string;
  badgeBg: string;
  badgeText: string;
  prefixes: string[];
  tagline: string;
}

export interface TelecomPackage {
  id: string;
  network: NetworkName;
  title: string;
  description: string;
  price: number;
  validity: string;
  category: 'daily' | 'weekly' | 'monthly' | 'all';
  dataMb?: number;
  minutes?: number;
  sms?: number;
}

export interface RetailerOrder {
  id: string;
  createdAt: string;
  number: string;
  network: NetworkName;
  item: string;
  amount: number;
  status: 'ok' | 'pending' | 'failed';
  paymentMethod: 'JazzCash' | 'EasyPaisa' | 'Cash';
  trxId: string;
  customerNote?: string;
}

export interface PricingConfigItem {
  id: string;
  name: string;
  network: NetworkName;
  category: string;
  price: number;
  originalPrice: number;
}
