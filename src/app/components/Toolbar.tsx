// src/app/components/Toolbar.tsx
"use client";

import React, { useState } from "react";
import styled from "styled-components";
import Link from "next/link";

interface ToolbarProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

const Navbar = styled.nav`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1200;
  display: flex;
  align-items: center;
  padding: 10px;
  background: #000; /* Black background */
  border-radius: 8px; /* Slight rounding for aesthetics */
`;

interface BurgerIconProps {
  $isOpen: boolean;
}

const BurgerIcon = styled.div<BurgerIconProps>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  padding: 10px;
  z-index: 1201;

  div {
    width: 35px;
    height: 4px;
    background-color: #fff; /* White bars */
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  div:nth-child(1) {
    transform: ${({ $isOpen }) => ($isOpen ? "rotate(45deg) translate(10px, 10px)" : "rotate(0)")};
  }

  div:nth-child(2) {
    opacity: ${({ $isOpen }) => ($isOpen ? "0" : "1")};
  }

  div:nth-child(3) {
    transform: ${({ $isOpen }) => ($isOpen ? "rotate(-45deg) translate(10px, -10px)" : "rotate(0)")};
  }
`;

const Menu = styled.div<{ $isMenuOpen: boolean }>`
  display: ${({ $isMenuOpen }) => ($isMenuOpen ? "flex" : "none")};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1100;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const MenuItemsWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const BottomWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const MenuItem = styled.a<{ $isActive: boolean }>`
  font-family: "Helvetica", Arial, sans-serif;
  font-size: 32px;
  font-weight: bold;
  color: ${({ $isActive }) => ($isActive ? "#FFDD00" : "#fff")};
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.2s ease;
  padding: 12px;
  letter-spacing: 1.5px;
  text-decoration: none;

  &:hover {
    color: #ffdd00;
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Toolbar: React.FC<ToolbarProps> = ({ activeTab, onTabChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <Navbar>
        <BurgerIcon onClick={toggleMenu} $isOpen={isMenuOpen}>
          <div />
          <div />
          <div />
        </BurgerIcon>
      </Navbar>

      <Menu $isMenuOpen={isMenuOpen}>
        <MenuItemsWrapper>
          <Link href="/" passHref legacyBehavior>
            <MenuItem $isActive={activeTab === "Home"} onClick={() => handleTabClick("Home")}>
              Home
            </MenuItem>
          </Link>
          <Link href="/utlaan" passHref legacyBehavior>
            <MenuItem $isActive={activeTab === "utlaan"} onClick={() => handleTabClick("utlaan")}>
              Utlån
            </MenuItem>
          </Link>
          <Link href="/lever" passHref legacyBehavior>
            <MenuItem $isActive={activeTab === "lever"} onClick={() => handleTabClick("lever")}>
              Lever
            </MenuItem>
          </Link>
          <Link href="/info" passHref legacyBehavior>
            <MenuItem $isActive={activeTab === "info"} onClick={() => handleTabClick("info")}>
              Info
            </MenuItem>
          </Link>
        </MenuItemsWrapper>

        <BottomWrapper>
          <Link href="/login" passHref legacyBehavior>
            <MenuItem $isActive={activeTab === "login"} onClick={() => handleTabClick("login")}>
              Login
            </MenuItem>
          </Link>
          <Link href="/adminPage" passHref legacyBehavior>
            <MenuItem $isActive={activeTab === "admin"} onClick={() => handleTabClick("admin")}>
              Admin
            </MenuItem>
          </Link>
        </BottomWrapper>
      </Menu>
    </>
  );
};

export default Toolbar;