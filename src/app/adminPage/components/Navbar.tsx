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
import MenuIcon from "@mui/icons-material/Menu";

const Nav = styled.nav<{ $isOpen: boolean }>`
  background: #ffffff;
  padding: 10px 20px;
  position: fixed;
  bottom: 0; /* Moved to bottom */
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center; /* Center tabs */
  align-items: center;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1); /* Shadow on top */
  font-family: "Helvetica", Arial, sans-serif;
  height: 60px; /* Fixed height for tab bar */
`;

const NavList = styled.ul<{ $isOpen: boolean }>`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: 1200px; /* Match content width */
  justify-content: space-around; /* Spread tabs evenly */

  @media (max-width: 768px) {
    flex-direction: column;
    position: fixed; /* Fixed for dropdown */
    bottom: 60px; /* Position above navbar when open */
    left: 0;
    width: 200px;
    background: #ffffff;
    box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1);
    display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
    align-items: flex-start;
  }
`;

const NavItem = styled.li<{ $isActive: boolean }>`
  padding: 10px 20px;
  color: ${({ $isActive }) => ($isActive ? "#1a1a1a" : "#666")}; /* Darker active text */
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: ${({ $isActive }) => ($isActive ? "bold" : "normal")};
  background: ${({ $isActive }) => ($isActive ? "#f0f0f0" : "transparent")}; /* Active tab background */
  border-top: ${({ $isActive }) => ($isActive ? "2px solid #1a1a1a" : "none")}; /* Tab indicator */
  flex: 1; /* Equal width for tabs */
  justify-content: center; /* Center content */
  text-align: center;
  transition: background 0.3s ease, color 0.3s ease;

  &:hover {
    background: #f5f5f5; /* Lighter hover */
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start; /* Left-align in mobile menu */
    border-top: none; /* No tab indicator in mobile menu */
    background: ${({ $isActive }) => ($isActive ? "#f0f0f0" : "#fff")};
  }
`;

const Hamburger = styled.button`
  display: none;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  position: absolute;
  right: 20px; /* Align to right */

  @media (max-width: 768px) {
    display: block;
  }

  svg {
    font-size: 28px;
  }
`;

export default function Navbar() {
  const { activeTab, onTabChange } = useAdminContext();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    console.log(`[Navbar] Toggling menu: ${!isMenuOpen}`);
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <Nav $isOpen={isMenuOpen}>
      <Hamburger onClick={toggleMenu}>
        <MenuIcon />
      </Hamburger>
      <NavList $isOpen={isMenuOpen}>
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
      </NavList>
    </Nav>
  );
}