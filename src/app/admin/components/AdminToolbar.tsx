"use client";

import React from "react";
import styled from "styled-components";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PersonIcon from "@mui/icons-material/Person";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SettingsIcon from "@mui/icons-material/Settings";

const AdminSidebar = styled.div<{ isOpen: boolean }>`
  font-family: "Helvetica", Arial, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${({ isOpen }) => (isOpen ? "200px" : "0")};
  background-color: #f5f5f5;
  color: #1a1a1a;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  box-shadow: ${({ isOpen }) => (isOpen ? "1px 0 3px rgba(0, 0, 0, 0.1)" : "none")};
  z-index: 1000;
  transition: width 0.3s ease;
  overflow: hidden;
`;

const SidebarItem = styled.div<{ isActive: boolean }>`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: ${({ isActive }) => (isActive ? "#1a1a1a" : "transparent")};
  color: ${({ isActive }) => (isActive ? "#fff" : "#1a1a1a")};
  font-size: 16px;
  transition: background-color 0.3s ease, color 0.3s ease;
  white-space: nowrap;

  &:hover {
    background-color: #e0e0e0;
  }

  svg {
    margin-right: 10px;
    font-size: 20px;
  }
`;

const AdminToolbar = ({
  activeTab,
  onTabChange,
  isOpen,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
}) => {
  return (
    <AdminSidebar isOpen={isOpen}>
      <SidebarItem isActive={activeTab === "home"} onClick={() => onTabChange("home")}>
        {activeTab === "home" ? <HomeIcon /> : <HomeOutlinedIcon />}
        Dashboard
      </SidebarItem>
      <SidebarItem isActive={activeTab === "users"} onClick={() => onTabChange("users")}>
        {activeTab === "users" ? <PersonIcon /> : <PersonOutlineIcon />}
        Users
      </SidebarItem>
      <SidebarItem isActive={activeTab === "items"} onClick={() => onTabChange("items")}>
        {activeTab === "items" ? <Inventory2Icon /> : <Inventory2OutlinedIcon />}
        Items
      </SidebarItem>
      <SidebarItem
        isActive={activeTab === "settings"}
        onClick={() => onTabChange("settings")}
      >
        {activeTab === "settings" ? <SettingsIcon /> : <SettingsOutlinedIcon />}
        Settings
      </SidebarItem>
    </AdminSidebar>
  );
};

export default AdminToolbar;