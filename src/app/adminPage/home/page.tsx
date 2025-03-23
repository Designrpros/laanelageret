// src/app/admin/Dashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface Item {
  id: string;
  name: string;
  inStock: number;
  rented: number;
  category: string;
}

interface User {
  id: string;
  email: string;
  rentals: { itemId: string; name: string; quantity: number; date: string }[];
  cart?: { items: { id: string; quantity: number }[] };
}

interface Report {
  status: string;
  reportedAt: string;
}

const DashboardContainer = styled.div`
  background: #fff;
  padding: clamp(15px, 3vw, 30px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;

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

const StatBox = styled.div`
  background: #f9f9f9;
  padding: clamp(10px, 2vw, 15px);
  border-radius: 8px;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
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
      const totalItems = snapshot.size;
      const itemsInStock = items.reduce((sum, item) => sum + item.inStock, 0);
      const itemsRented = items.reduce((sum, item) => sum + item.rented, 0);
      const lowStockItems = items.filter((item) => item.inStock < 5).length;
      const totalCategories = new Set(items.map((item) => item.category)).size;

      setStats((prev) => ({
        ...prev,
        totalItems,
        itemsInStock,
        itemsRented,
        lowStockItems,
        totalCategories,
      }));
      updateStats();
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      console.log("Users fetched:", snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() })));
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email || "Unknown",
        rentals: doc.data().rentals || [],
        cart: doc.data().cart || { items: [] },
      })) as User[];
      const totalUsers = snapshot.size;
      const rentals = users.flatMap((user) => user.rentals);
      const activeLoans = rentals.length;
      const usersWithLoans = users.filter((user) => user.rentals.length > 0).length;
      const recentRentals = rentals.filter((rental) => {
        const rentalDate = new Date(rental.date);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return rentalDate >= sevenDaysAgo;
      }).length;
      const cartItems = users.reduce(
        (sum, user) => sum + (user.cart?.items || []).reduce((s, i) => s + i.quantity, 0),
        0
      );

      setStats((prev) => ({
        ...prev,
        totalUsers,
        activeLoans,
        usersWithLoans,
        recentRentals,
        cartItems,
      }));
      updateStats();
    });

    const unsubReports = onSnapshot(collection(db, "reports"), (snapshot) => {
      const reports = snapshot.docs.map((doc) => doc.data() as Report);
      const totalReports = snapshot.size;
      const pendingReports = reports.filter((r) => r.status === "pending").length;
      const resolvedReports = reports.filter((r) => r.status === "resolved").length;

      setStats((prev) => ({
        ...prev,
        totalReports,
        pendingReports,
        resolvedReports,
      }));
      updateStats();
    });

    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      setStats((prev) => ({ ...prev, totalCategories: snapshot.size }));
      updateStats();
    });

    return () => {
      clearTimeout(timeout);
      unsubItems();
      unsubUsers();
      unsubReports();
      unsubCategories();
    };
  }, []);

  if (loading) return <DashboardContainer>Loading...</DashboardContainer>;

  return (
    <DashboardContainer>
      <Title>Admin Dashboard</Title>

      <Section>
        <SectionTitle>Inventory</SectionTitle>
        <StatsContainer>
          <StatBox>
            <StatNumber>{stats.totalItems}</StatNumber>
            <StatLabel>Total Items</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber>{stats.itemsInStock}</StatNumber>
            <StatLabel>Items in Stock</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber>{stats.itemsRented}</StatNumber>
            <StatLabel>Items Rented</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber>{stats.lowStockItems}</StatNumber>
            <StatLabel>Low Stock Items (&lt; 5)</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber>{stats.totalCategories}</StatNumber>
            <StatLabel>Total Categories</StatLabel>
          </StatBox>
        </StatsContainer>
      </Section>

      <Section>
        <SectionTitle>Users</SectionTitle>
        <StatsContainer>
          <StatBox>
            <StatNumber>{stats.totalUsers}</StatNumber>
            <StatLabel>Total Users</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber>{stats.activeLoans}</StatNumber>
            <StatLabel>Active Loans</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber>{stats.usersWithLoans}</StatNumber>
            <StatLabel>Users with Loans</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber>{stats.recentRentals}</StatNumber>
            <StatLabel>Recent Rentals (7 days)</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber>{stats.cartItems}</StatNumber>
            <StatLabel>Items in Carts</StatLabel>
          </StatBox>
        </StatsContainer>
      </Section>

      <Section>
        <SectionTitle>Reports</SectionTitle>
        <StatsContainer>
          <StatBox>
            <StatNumber>{stats.pendingReports}</StatNumber>
            <StatLabel>Pending Reports</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber>{stats.resolvedReports}</StatNumber>
            <StatLabel>Resolved Reports</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber>{stats.totalReports}</StatNumber>
            <StatLabel>Total Reports</StatLabel>
          </StatBox>
        </StatsContainer>
      </Section>

      <LastUpdated>Last Updated: {stats.lastUpdated}</LastUpdated>
    </DashboardContainer>
  );
}