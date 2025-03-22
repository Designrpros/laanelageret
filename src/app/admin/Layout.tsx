"use client";

import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import AdminToolbar from "./components/AdminToolbar";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #fff;
`;

const MainContent = styled.div<{ sidebarOpen: boolean }>`
  margin-left: ${({ sidebarOpen }) => (sidebarOpen ? "200px" : "24px")}; /* 24px for chevron width */
  padding: 20px;
  flex-grow: 1;
  background-color: #fff;
  color: #1a1a1a;
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const ToggleButton = styled.button<{ isOpen: boolean }>`
  position: fixed;
  top: 50%;
  left: ${({ isOpen }) => (isOpen ? "190px" : "0")}; /* Closer to edge: 0 when closed, 190px when open */
  transform: translateY(-50%);
  background: transparent; /* No background */
  color: #1a1a1a; /* Black icon to match theme */
  border: none;
  padding: 4px; /* Reduced padding for minimalism */
  cursor: pointer;
  z-index: 1100;
  transition: left 0.3s ease;

  &:hover {
    color: #333; /* Slightly darker on hover */
  }

  svg {
    font-size: 24px; /* Keep icon size */
  }
`;

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open on desktop

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <LayoutWrapper>
      <AdminToolbar activeTab={activeTab} onTabChange={onTabChange} isOpen={isSidebarOpen} />
      <ToggleButton isOpen={isSidebarOpen} onClick={toggleSidebar}>
        {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </ToggleButton>
      <MainContent sidebarOpen={isSidebarOpen}>{children}</MainContent>
    </LayoutWrapper>
  );
};

export default Layout;