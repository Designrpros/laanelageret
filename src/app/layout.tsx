// src/app/layout.tsx
"use client";

import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import Toolbar from "./components/Toolbar";
import { usePathname, useRouter } from "next/navigation";

const GlobalStyle = createGlobalStyle`
  body, html { margin: 0; padding: 0; overflow-x: hidden; height: 100%; }
`;

const HeroSection = styled.section`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: -1;
`;

const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isAdminRoute = pathname?.startsWith("/adminPage");

  const activeTab = pathname === "/" ? "Home" :
                    pathname.startsWith("/utlaan") ? "utlaan" :
                    pathname === "/info" ? "info" :
                    pathname === "/lever" ? "lever" :
                    pathname === "/login" ? "login" :
                    isAdminRoute ? "admin" : "Home";

  const handleTabChange = (tab: string) => {
    router.push(
      tab === "Home" ? "/" :
      tab === "utlaan" ? "/utlaan/1" :
      tab === "lever" ? "/lever" :
      tab === "login" ? "/login" :
      tab === "admin" ? "/adminPage" :
      `/${tab.toLowerCase()}`
    );
  };

  return (
    <html lang="en">
      <head />
      <body>
        <GlobalStyle />
        {!isAdminRoute && (
          <HeroSection>
            <BackgroundImage src="/RentalBackground.jpg" alt="Rental Background" />
          </HeroSection>
        )}
        <Toolbar activeTab={activeTab} onTabChange={handleTabChange} />
        {children}
      </body>
    </html>
  );
}