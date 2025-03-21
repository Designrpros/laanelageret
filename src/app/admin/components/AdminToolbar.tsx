"use client";

import React from "react";
import styled from "styled-components";
import { FaHome, FaUserAlt, FaBox, FaCog } from "react-icons/fa";

// Styled-components for the Admin Toolbar
const AdminSidebar = styled.div`
font-family: "Helvetica", Arial, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 250px;
  background-color: #1e1e1e; /* Darker blackish background */
  color: white;
  display: flex;
  flex-direction: column;
  padding-top: 30px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.3); /* Deeper shadow */
  z-index: 1;
  transition: all 0.3s ease; /* Smooth transition on hover */
`;

const SidebarItem = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isActive'].includes(prop), // Ensure isActive doesn't get passed to the DOM
})<{ isActive: boolean }>`
  padding: 18px 25px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: ${({ isActive }) => (isActive ? "#333" : "transparent")}; /* Active color */
  color: ${({ isActive }) => (isActive ? "#ffdd00" : "#bdc3c7")}; /* Light grey for inactive */
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: #333; /* Subtle dark grey hover effect */
    transform: translateX(10px); /* Slight shift for hover */
  }

  svg {
    margin-right: 15px;
    font-size: 20px;
    transition: color 0.3s ease;
  }

  &:hover svg {
    color: white; /* Icons turn white on hover */
  }
`;

const AdminToolbar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  return (
    <AdminSidebar>
      <SidebarItem
        isActive={activeTab === "home"}
        onClick={() => onTabChange("home")}
      >
        <FaHome />
        Dashboard
      </SidebarItem>
      <SidebarItem
        isActive={activeTab === "users"}
        onClick={() => onTabChange("users")}
      >
        <FaUserAlt />
        Users
      </SidebarItem>
      <SidebarItem
        isActive={activeTab === "items"}
        onClick={() => onTabChange("items")}
      >
        <FaBox />
        Items
      </SidebarItem>
      <SidebarItem
        isActive={activeTab === "settings"}
        onClick={() => onTabChange("settings")}
      >
        <FaCog />
        Settings
      </SidebarItem>
    </AdminSidebar>
  );
};

export default AdminToolbar;