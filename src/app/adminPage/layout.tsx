"use client";

import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import AdminToolbar from "./components/AdminToolbar";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { AdminProvider } from "./AdminContext";

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #fff;
`;

const MainContent = styled.div<{ $sidebarOpen: boolean }>`
  margin-left: ${({ $sidebarOpen }) => ($sidebarOpen ? "200px" : "24px")};
  flex-grow: 1;
  width: ${({ $sidebarOpen }) => ($sidebarOpen ? "calc(100% - 200px)" : "calc(100% - 24px)")};
  transition: margin-left 0.2s ease-out;
`;

const ToggleButton = styled.button<{ $isOpen: boolean }>`
  position: fixed;
  top: 50%;
  left: ${({ $isOpen }) => ($isOpen ? "190px" : "0")};
  transform: translateY(-50%);
  background: transparent;
  color: #1a1a1a;
  border: none;
  padding: 4px;
  cursor: pointer;
  z-index: 1100;
  transition: left 0.2s ease-out;

  &:hover {
    color: #333;
  }

  svg {
    font-size: 24px;
  }
`;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  return (
    <AdminProvider>
      <LayoutWrapper>
        <AdminToolbar />
        <ToggleButton $isOpen={isSidebarOpen} onClick={toggleSidebar}>
          {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </ToggleButton>
        <MainContent $sidebarOpen={isSidebarOpen}>{children}</MainContent>
      </LayoutWrapper>
    </AdminProvider>
  );
}