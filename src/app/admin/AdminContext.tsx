// src/app/admin/AdminContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AdminContextType {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState("home");

  const onTabChange = (tab: string) => {
    console.log("Context onTabChange triggered with tab:", tab);
    setActiveTab(tab);
  };

  return (
    <AdminContext.Provider value={{ activeTab, onTabChange }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return context;
};