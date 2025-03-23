"use client";

import React from "react";
import { AdminProvider, useAdminContext } from "./AdminContext";
import Navbar from "./components/Navbar";
import Home from "./home/page";
import Users from "./users/page";
import Items from "./items/page";
import LostOrBroken from "./lost-or-broken/page";
import styled from "styled-components";

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  width: 100vw; /* Full viewport width */
  overflow-x: hidden; /* Prevent horizontal overflow */
`;

const ContentWrapper = styled.main`
  flex-grow: 1;
  padding: clamp(10px, 2vw, 20px);
  width: 100%; /* Full width */
  max-width: 100vw; /* Cap at viewport width */
  margin: 60px auto 0; /* Navbar offset */
  box-sizing: border-box; /* Include padding in width */

  @media (max-width: 768px) {
    margin-top: 70px; /* Extra space for mobile navbar */
    padding: 10px; /* Tighten padding */
  }
`;

const AdminContent = () => {
  const { activeTab } = useAdminContext();

  const renderActiveTab = () => {
    console.log(`[AdminContent] Rendering tab: ${activeTab}`);
    switch (activeTab) {
      case "home":
        return <Home />;
      case "users":
        return <Users />;
      case "items":
        return <Items />;
      case "lost-or-broken":
        return <LostOrBroken />;
      default:
        return <div>Invalid tab: {activeTab}</div>;
    }
  };

  return <ContentWrapper>{renderActiveTab()}</ContentWrapper>;
};

export default function AdminPanel() {
  return (
    <AdminProvider>
      <LayoutWrapper>
        <Navbar />
        <AdminContent />
      </LayoutWrapper>
    </AdminProvider>
  );
}