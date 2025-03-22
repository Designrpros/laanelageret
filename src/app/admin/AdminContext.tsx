// src/app/admin/AdminContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AdminContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onTabChange: (tab: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home"); // Default to "home"

  const onTabChange = useCallback((tab: string) => {
    console.log("AdminContext onTabChange called with tab:", tab);
    const validTabs = ["home", "users", "items", "lost-or-broken"];
    const newTab = validTabs.includes(tab) ? tab : "home"; // Fallback to "home" if invalid
    setActiveTab(newTab);
    const path = `/admin/${newTab === "home" ? "" : newTab}`;
    router.push(path, { scroll: false });
    console.log("Set activeTab to:", newTab, "Navigated to:", path);
  }, [router]);

  return (
    <AdminContext.Provider value={{ activeTab, setActiveTab, onTabChange }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdminContext must be used within an AdminProvider");
  return context;
};