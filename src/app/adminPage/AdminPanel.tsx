"use client";

import React from "react";
import { AdminProvider, useAdminContext } from "./AdminContext";
import Navbar from "./components/Navbar";
import Home from "./home/page";
import Users from "./users/page";
import Items from "./items/page";
import LostOrBroken from "./lost-or-broken/page";
import Receipts from "./receipts/page";
import History from "./history/page";
import Analytics from "./analytics/page"; // New import
import styled from "styled-components";

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  width: 100vw;
  overflow-x: hidden;
`;

const ContentWrapper = styled.main`
  flex-grow: 1;
  padding: clamp(10px, 2vw, 20px);
  width: 100%;
  max-width: 100vw;
  margin: 0 auto 60px; /* Bottom margin for navbar */
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-bottom: 70px;
    padding: 10px;
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
      case "receipts":
        return <Receipts />;
      case "history":
        return <History />;
      case "analytics":
        return <Analytics />;
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