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
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: "Helvetica", Arial, sans-serif;

`;

const NavList = styled.ul<{ $isOpen: boolean }>`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    width: 200px;
    background: #ffffff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
    align-items: flex-start;
  }
`;

const NavItem = styled.li<{ $isActive: boolean }>`
  padding: 10px 20px;
  color: ${({ $isActive }) => ($isActive ? "#333" : "#333")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: ${({ $isActive }) => ($isActive ? "bold" : "normal")};

  &:hover {
    background: #f0f0f0;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const Hamburger = styled.button`
  display: none;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;

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