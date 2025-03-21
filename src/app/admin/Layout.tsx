"use client";

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import AdminToolbar from './components/AdminToolbar';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Container for the entire layout
const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
`;

// Sidebar container (fixed)
const Sidebar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 250px;
  background-color: #1e1e1e;
  color: white;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;

// Main content area
const MainContent = styled.div`
  margin-left: 250px;
  padding: 20px;
  flex-grow: 1;
  background-color: black;  // Set black background for the main content
  color: white;             // Ensure the text is white
`;

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <LayoutWrapper>
      {/* Sidebar stays fixed */}
      <Sidebar>
        <AdminToolbar activeTab={activeTab} onTabChange={onTabChange} />
      </Sidebar>

      {/* Main content area */}
      <MainContent>
        {children} {/* Render the tab content */}
      </MainContent>
    </LayoutWrapper>
  );
};

export default Layout;