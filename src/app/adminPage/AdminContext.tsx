"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface AdminContextType {
  activeTab: string;
  onTabChange: (tab: string) => void;
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
  const [activeTab, setActiveTab] = useState("home");

  const onTabChange = useCallback((tab: string) => {
    console.log(`[AdminContext] Switching to tab: ${tab}`);
    setActiveTab(tab);
  }, []);

  return (
    <AdminContext.Provider value={{ activeTab, onTabChange }}>
      {children}
    </AdminContext.Provider>
  );
};