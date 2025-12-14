import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface SelectedPackage {
  id: string;
  package_code: string;
  package_name: string;
  country_name: string;
  country_code: string;
  data_amount: number;
  validity: number;
  price: number;
  retail_price: number;
  currency: string;
  description?: string | null;
}

interface OrderContextType {
  selectedPackage: SelectedPackage | null;
  setSelectedPackage: (pkg: SelectedPackage | null) => void;
  clearSelectedPackage: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [selectedPackage, setSelectedPackage] = useState<SelectedPackage | null>(null);

  const clearSelectedPackage = useCallback(() => {
    console.log('🗑️ Clearing selected package');
    setSelectedPackage(null);
  }, []);

  const handleSetSelectedPackage = useCallback((pkg: SelectedPackage | null) => {
    console.log('📦 OrderContext: Setting package:', pkg);
    setSelectedPackage(pkg);
  }, []);

  return (
    <OrderContext.Provider value={{
      selectedPackage,
      setSelectedPackage: handleSetSelectedPackage,
      clearSelectedPackage
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
}
