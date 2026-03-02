/**
 * BusinessContext - business type for future dynamic theming
 * UI can later change based on businessType (e.g. electrician, plumber)
 */

import React, { createContext, useContext } from 'react';

export type BusinessType = 'electrician' | 'plumber' | 'general';

interface BusinessContextValue {
  businessType: BusinessType;
}

const defaultValue: BusinessContextValue = {
  businessType: 'electrician',
};

const BusinessContext = createContext<BusinessContextValue>(defaultValue);

export function BusinessProvider({
  children,
  businessType = 'electrician',
}: {
  children: React.ReactNode;
  businessType?: BusinessType;
}) {
  return (
    <BusinessContext.Provider value={{ businessType }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
