// src/app/admin/components/AdminToolbar.tsx
"use client";

import React, { memo, useEffect } from "react";
import styled from "styled-components";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PersonIcon from "@mui/icons-material/Person";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { useAdminContext } from "../AdminContext";

const AdminSidebar = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 200px;
  background-color: #f5f5f5;
  color: #1a1a1a;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  box-shadow: ${({ $isOpen }) => ($isOpen ? "1px 0 3px rgba(0, 0, 0, 0.1)" : "none")};
  z-index: 1000;
  transform: ${({ $isOpen }) => ($isOpen ? "translateX(0)" : "translateX(-100%)")};
  transition: transform 0.2s ease-out;
`;

const SidebarItem = styled.div<{ $isActive: boolean }>`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: ${({ $isActive }) => ($isActive ? "#1a1a1a" : "transparent")};
  color: ${({ $isActive }) => ($isActive ? "#fff" : "#1a1a1a")};
  font-size: 16px;
  transition: background-color 0.2s ease-out, color 0.2s ease-out;

  &:hover {
    background-color: #e0e0e0;
  }

  svg {
    margin-right: 10px;
    font-size: 20px;
  }
`;

const MemoizedSidebarItem = memo(SidebarItem);

interface AdminToolbarProps {
  isOpen: boolean;
}

const AdminToolbar = memo(({ isOpen }: AdminToolbarProps) => {
  const { activeTab, onTabChange } = useAdminContext();

  useEffect(() => {
    console.log("AdminToolbar mounted - activeTab:", activeTab, "onTabChange:", typeof onTabChange);
  }, []);

  console.log("AdminToolbar render - activeTab:", activeTab, "onTabChange:", typeof onTabChange);

  return (
    <AdminSidebar $isOpen={isOpen}>
      <MemoizedSidebarItem $isActive={activeTab === "home"} onClick={() => onTabChange("home")}>
        {activeTab === "home" ? <HomeIcon /> : <HomeOutlinedIcon />}
        Dashboard
      </MemoizedSidebarItem>
      <MemoizedSidebarItem $isActive={activeTab === "users"} onClick={() => onTabChange("users")}>
        {activeTab === "users" ? <PersonIcon /> : <PersonOutlineIcon />}
        Users
      </MemoizedSidebarItem>
      <MemoizedSidebarItem $isActive={activeTab === "items"} onClick={() => onTabChange("items")}>
        {activeTab === "items" ? <Inventory2Icon /> : <Inventory2OutlinedIcon />}
        Items
      </MemoizedSidebarItem>
      <MemoizedSidebarItem
        $isActive={activeTab === "lost-or-broken"}
        onClick={() => onTabChange("lost-or-broken")}
      >
        {activeTab === "lost-or-broken" ? <ReportProblemIcon /> : <ReportProblemOutlinedIcon />}
        Lost/Broken
      </MemoizedSidebarItem>
    </AdminSidebar>
  );
});

export default AdminToolbar;