export interface Country {
  id: string;
  code: string;
  name: string;
  region: 'Americas' | 'Europe' | 'Asia' | 'Africa' | 'Oceania';
  flag: string;
  pricePerGb: number;
  minRetailPrice?: number;
  currency: string;
  packages: EsimPackage[];
  isTopCountry: boolean;
}

export interface EsimPackage {
  id: string;
  countryId: string;
  dataAmount: number;
  validity: number;
  price: number;
  retailPrice: number;
  currency: string;
  description: string;
}

export interface Esim {
  id: string;
  userId: string;
  countryCode: string;
  countryName: string;
  packageId: string;
  iccid: string;
  activationCode: string;
  qrCode: string;
  status: 'active' | 'inactive' | 'expired';
  dataUsed: number;
  dataTotal: number;
  purchaseDate: string;
  expiryDate: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  email: string;
  esimId?: string;
  promoCode?: string;
  discount: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  balance: number;
  currency: string;
  is_admin?: boolean;
  createdAt: string;
  lastLogin: string;
  preferences: {
    language: 'en' | 'ka';
    notifications: boolean;
    dataAlerts: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Balance Response from /balance/query
export interface EsimAccessBalance {
  balance: number;
  currency: string;
}

// Package structure from /package/list
export interface EsimAccessPackage {
  packageCode: string;
  packageName: string;
  locationCode: string;
  locationName: string;
  dataAmount: number;
  validity: number;
  price: number;
  retailPrice: number;
  currency: string;
  description?: string;
}

// Order response from /esim/order
export interface EsimAccessOrder {
  orderNo: string;
  packageCode: string;
  count: number;
  totalPrice: number;
  orderStatus: string;
  createdTime: string;
}

// eSIM details from /esim/query
export interface EsimAccessStatus {
  orderNo: string;
  iccid: string;
  qrCode: string;
  activationCode: string;
  packageCode: string;
  locationName: string;
  dataAmount: number;
  usedData: number;
  remainingData: number;
  validFrom: string;
  expiredTime: string;
  orderStatus: string;
}

// Top-up response from /esim/topup
export interface EsimTopupResponse {
  iccid: string;
  addedData: number;
  totalVolume: number;
  totalDuration: number;
  newExpiredTime: string;
  status: string;
}
