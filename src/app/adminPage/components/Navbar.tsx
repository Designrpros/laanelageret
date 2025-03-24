"use client";

import React from "react";
import styled from "styled-components";
import { useAdminContext } from "../AdminContext";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PersonIcon from "@mui/icons-material/Person";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import HistoryIcon from "@mui/icons-material/History";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined"; // New icon
import AnalyticsIcon from "@mui/icons-material/Analytics"; // Filled icon

const Nav = styled.nav`
  background: #ffffff;
  padding: 10px 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  font-family: "Helvetica", Arial, sans-serif;
  height: 60px;
`;

const NavList = styled.ul`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0 10px;
  width: 100%;
  max-width: 1200px;
  justify-content: space-around;

  @media (max-width: 768px) {
    flex-direction: row;
    overflow-x: auto;
    white-space: nowrap;
    justify-content: flex-start;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const NavItem = styled.li<{ $isActive: boolean }>`
  padding: 10px 20px;
  color: ${({ $isActive }) => ($isActive ? "#1a1a1a" : "#666")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: ${({ $isActive }) => ($isActive ? "bold" : "normal")};
  background: ${({ $isActive }) => ($isActive ? "#f0f0f0" : "transparent")};
  border-top: ${({ $isActive }) => ($isActive ? "2px solid #1a1a1a" : "none")};
  flex: 1;
  justify-content: center;
  text-align: center;
  transition: background 0.3s ease, color 0.3s ease;

  &:hover {
    background: #f5f5f5;
  }

  @media (max-width: 768px) {
    flex: none;
    min-width: 120px;
    justify-content: center;
    border-top: ${({ $isActive }) => ($isActive ? "2px solid #1a1a1a" : "none")};
  }
`;

export default function Navbar() {
  const { activeTab, onTabChange } = useAdminContext();

  return (
    <Nav>
      <NavList>
        <NavItem
          $isActive={activeTab === "home"}
          onClick={() => onTabChange("home")}
        >
          {activeTab === "home" ? <HomeIcon /> : <HomeOutlinedIcon />}
          Dashboard
        </NavItem>
        <NavItem
          $isActive={activeTab === "users"}
          onClick={() => onTabChange("users")}
        >
          {activeTab === "users" ? <PersonIcon /> : <PersonOutlineIcon />}
          Users
        </NavItem>
        <NavItem
          $isActive={activeTab === "items"}
          onClick={() => onTabChange("items")}
        >
          {activeTab === "items" ? <Inventory2Icon /> : <Inventory2OutlinedIcon />}
          Items
        </NavItem>
        <NavItem
          $isActive={activeTab === "lost-or-broken"}
          onClick={() => onTabChange("lost-or-broken")}
        >
          {activeTab === "lost-or-broken" ? <ReportProblemIcon /> : <ReportProblemOutlinedIcon />}
          Lost/Broken
        </NavItem>
        <NavItem
          $isActive={activeTab === "receipts"}
          onClick={() => onTabChange("receipts")}
        >
          {activeTab === "receipts" ? <ReceiptIcon /> : <ReceiptOutlinedIcon />}
          Receipts
        </NavItem>
        <NavItem
          $isActive={activeTab === "history"}
          onClick={() => onTabChange("history")}
        >
          {activeTab === "history" ? <HistoryIcon /> : <HistoryOutlinedIcon />}
          History
        </NavItem>
        <NavItem
          $isActive={activeTab === "analytics"}
          onClick={() => onTabChange("analytics")}
        >
          {activeTab === "analytics" ? <AnalyticsIcon /> : <AnalyticsOutlinedIcon />}
          Analytics
        </NavItem>
      </NavList>
    </Nav>
  );
}