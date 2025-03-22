"use client";

import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import Toolbar from "./components/Toolbar";
import { usePathname } from "next/navigation";

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
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures the image covers the area like the video did */
  position: absolute;
  top: 0;
  left: 0;
`;

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTab = pathname === "/" ? "Home" :
                    pathname.startsWith("/utlaan") ? "utlaan" :
                    pathname === "/info" ? "info" :
                    pathname === "/lever" ? "lever" :
                    pathname === "/login" ? "login" :
                    pathname.startsWith("/admin") ? "admin" : "Home";

  return (
    <html lang="en">
      <head />
      <body>
        <GlobalStyle />
        <HeroSection>
          <BackgroundImage src="/RentalBackground.jpg" alt="Rental Background" />
        </HeroSection>
        <Toolbar activeTab={activeTab} onTabChange={() => {}} />
        {children}
      </body>
    </html>
  );
}