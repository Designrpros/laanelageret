// src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Homepage from "./HomePage/page";
import Projects from "./utlaan/page";
import Info from "./info/page";

const Home = () => {
  const [activeTab, setActiveTab] = useState<string>("Home");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setActiveTab(
      pathname === "/"
        ? "Home"
        : pathname.startsWith("/utlaan")
        ? "utlaan"
        : pathname === "/info"
        ? "info"
        : "Home"
    );
  }, [pathname]);

  const Content =
    activeTab === "utlaan" ? <Projects /> : activeTab === "info" ? <Info /> : <Homepage />;

  return <>{Content}</>;
};

export default Home;