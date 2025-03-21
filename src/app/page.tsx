// src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Layout from "./layout"; // Adjust path if needed
import Toolbar from "./components/Toolbar"; // Adjust path if needed
import Homepage from "./HomePage/page"; // Adjust path if needed
import Projects from "./utlaan/page"; // Adjust path if needed
import Info from "./info/page"; // Adjust path if needed

const Home = () => {
  const [activeTab, setActiveTab] = useState<string>("Home");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setActiveTab(
      pathname === "/"
        ? "Home"
        : pathname === "/utlaan"
        ? "utlaan"
        : pathname === "/info"
        ? "info"
        : "Home"
    );
  }, [pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(tab === "Home" ? "/" : `/${tab.toLowerCase()}`);
  };

  const Content =
    activeTab === "utlaan" ? <Projects /> : activeTab === "info" ? <Info /> : <Homepage />;

  return (
    <Layout>
      <Toolbar activeTab={activeTab} onTabChange={handleTabChange} />
      {Content}
    </Layout>
  );
};

export default Home;