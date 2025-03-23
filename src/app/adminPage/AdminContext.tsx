"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AdminContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
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
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const onTabChange = useCallback(
    (tab: string) => {
      console.log(`[AdminContext] Navigating to tab: ${tab}`);
      setActiveTab(tab);
      router.push(`/adminPage/${tab === "home" ? "" : tab}`);
    },
    [router]
  );

  useEffect(() => {
    const tabFromPath = pathname === "/adminPage" ? "home" : pathname?.replace("/adminPage/", "") || "home";
    if (tabFromPath !== activeTab) {
      console.log(`[AdminContext] Syncing activeTab to ${tabFromPath} from pathname ${pathname}`);
      setActiveTab(tabFromPath);
    }
  }, [pathname]);

  return (
    <AdminContext.Provider value={{ isSidebarOpen, toggleSidebar, activeTab, onTabChange }}>
      {children}
    </AdminContext.Provider>
  );
};