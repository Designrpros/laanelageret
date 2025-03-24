// src/app/admin/Dashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

// Interfaces (unchanged)
interface Item { id: string; name: string; inStock: number; rented: number; category: string; }
interface User { id: string; email: string; rentals: { itemId: string; name: string; quantity: number; date: string }[]; cart?: { items: { id: string; quantity: number }[] }; }
interface Report { status: string; reportedAt: string; }

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalItems: 0,
    itemsInStock: 0,
    itemsRented: 0,
    lowStockItems: 0,
    totalCategories: 0,
    totalUsers: 0,
    activeLoans: 0,
    usersWithLoans: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalReports: 0,
    recentRentals: 0,
    cartItems: 0,
    lastUpdated: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const updateStats = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setStats((prev) => ({ ...prev, lastUpdated: new Date().toLocaleString() }));
        setLoading(false);
      }, 100);
    };

    const unsubItems = onSnapshot(collection(db, "items"), (snapshot) => {
      const items = snapshot.docs.map((doc) => doc.data() as Item);
      setStats((prev) => ({
        ...prev,
        totalItems: snapshot.size,
        itemsInStock: items.reduce((sum, item) => sum + item.inStock, 0),
        itemsRented: items.reduce((sum, item) => sum + item.rented, 0),
        lowStockItems: items.filter((item) => item.inStock < 5).length,
        totalCategories: new Set(items.map((item) => item.category)).size,
      }));
      updateStats();
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const users = snapshot.docs.map((doc) => doc.data() as User);
      const rentals = users.flatMap((user) => user.rentals);
      setStats((prev) => ({
        ...prev,
        totalUsers: snapshot.size,
        activeLoans: rentals.length,
        usersWithLoans: users.filter((user) => user.rentals.length > 0).length,
        recentRentals: rentals.filter((r) => new Date(r.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        cartItems: users.reduce((sum, user) => sum + (user.cart?.items || []).reduce((s, i) => s + i.quantity, 0), 0),
      }));
      updateStats();
    });

    const unsubReports = onSnapshot(collection(db, "reports"), (snapshot) => {
      const reports = snapshot.docs.map((doc) => doc.data() as Report);
      setStats((prev) => ({
        ...prev,
        totalReports: snapshot.size,
        pendingReports: reports.filter((r) => r.status === "pending").length,
        resolvedReports: reports.filter((r) => r.status === "resolved").length,
      }));
      updateStats();
    });

    return () => {
      clearTimeout(timeout);
      unsubItems();
      unsubUsers();
      unsubReports();
    };
  }, []);

  if (loading) return <DashboardContainer>Loading...</DashboardContainer>;

  return (
    <DashboardContainer>
      <Title>Admin Dashboard</Title>

      <Section>
        <SectionTitle>Inventory</SectionTitle>
        <StatsContainer>
          <StatBox><StatNumber>{stats.totalItems}</StatNumber><StatLabel>Total Items</StatLabel></StatBox>
          <StatBox><StatNumber>{stats.itemsInStock}</StatNumber><StatLabel>Items in Stock</StatLabel></StatBox>
          <StatBox><StatNumber>{stats.itemsRented}</StatNumber><StatLabel>Items Rented</StatLabel></StatBox>
          <StatBox $highlight={stats.lowStockItems > 0}><StatNumber>{stats.lowStockItems}</StatNumber><StatLabel>Low Stock (&lt; 5)</StatLabel></StatBox>
          <StatBox><StatNumber>{stats.totalCategories}</StatNumber><StatLabel>Total Categories</StatLabel></StatBox>
        </StatsContainer>
      </Section>

      <Section>
        <SectionTitle>Users</SectionTitle>
        <StatsContainer>
          <StatBox><StatNumber>{stats.totalUsers}</StatNumber><StatLabel>Total Users</StatLabel></StatBox>
          <StatBox><StatNumber>{stats.activeLoans}</StatNumber><StatLabel>Active Loans</StatLabel></StatBox>
          <StatBox><StatNumber>{stats.usersWithLoans}</StatNumber><StatLabel>Users with Loans</StatLabel></StatBox>
          <StatBox><StatNumber>{stats.recentRentals}</StatNumber><StatLabel>Recent Rentals (7d)</StatLabel></StatBox>
          <StatBox><StatNumber>{stats.cartItems}</StatNumber><StatLabel>Items in Carts</StatLabel></StatBox>
        </StatsContainer>
      </Section>

      <Section>
        <SectionTitle>Reports</SectionTitle>
        <StatsContainer>
          <StatBox $highlight={stats.pendingReports > 0}><StatNumber>{stats.pendingReports}</StatNumber><StatLabel>Pending Reports</StatLabel></StatBox>
          <StatBox><StatNumber>{stats.resolvedReports}</StatNumber><StatLabel>Resolved Reports</StatLabel></StatBox>
          <StatBox><StatNumber>{stats.totalReports}</StatNumber><StatLabel>Total Reports</StatLabel></StatBox>
        </StatsContainer>
      </Section>

      <LastUpdated>Last Updated: {stats.lastUpdated}</LastUpdated>
    </DashboardContainer>
  );
}

const DashboardContainer = styled.div`
  background: #fff;
  padding: clamp(15px, 3vw, 30px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Helvetica", Arial, sans-serif;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  font-family: "Helvetica", Arial, sans-serif;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Title = styled.h1`
  font-size: clamp(20px, 5vw, 32px);
  font-weight: bold;
  margin-bottom: clamp(15px, 3vw, 20px);
  text-align: center;
  color: #1a1a1a;
`;

const Section = styled.div`
  margin-bottom: clamp(20px, 4vw, 30px);
`;

const SectionTitle = styled.h2`
  font-size: clamp(16px, 3vw, 24px);
  font-weight: 600;
  color: #333;
  margin-bottom: clamp(10px, 2vw, 15px);
  text-align: center;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: clamp(10px, 2vw, 15px);
  justify-items: center;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// Styled components (modified StatBox for color coding)
const StatBox = styled.div<{ $highlight?: boolean }>`
  background: ${({ $highlight }) => ($highlight ? "#fff3f3" : "#f9f9f9")}; /* Light red for critical */
  padding: clamp(10px, 2vw, 15px);
  border-radius: 8px;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  ${({ $highlight }) => $highlight && "border: 1px solid #ff4444;"}
`;

const StatNumber = styled.div`
  font-size: clamp(18px, 3vw, 24px);
  font-weight: bold;
  color: #333;
`;

const StatLabel = styled.div`
  font-size: clamp(12px, 2vw, 14px);
  color: #555;
`;

const LastUpdated = styled.div`
  font-size: clamp(12px, 2vw, 14px);
  color: #888;
  text-align: center;
  margin-top: clamp(15px, 3vw, 20px);
`;
