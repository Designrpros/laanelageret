"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type AdminTab = "home" | "users" | "items" | "lost-or-broken" | "receipts" | "history" | "analytics";

interface AdminContextType {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("home");

  const onTabChange = useCallback((tab: AdminTab) => {
    console.log(`[AdminContext] Switching to tab: ${tab}`);
    setActiveTab(tab);
  }, []);

  return (
    <AdminContext.Provider value={{ activeTab, onTabChange }}>
      {children}
    </AdminContext.Provider>
  );
};