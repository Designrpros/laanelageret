// src/app/admin/home/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

const DashboardContainer = styled.div`
  font-family: "Helvetica", Arial, sans-serif;
  background-color: #333;
  padding: 30px;
  border-radius: 12px;
  color: white;
  max-width: 1000px;
  margin: 40px auto;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;

const Description = styled.p`
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 20px;
  text-align: center;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
`;

const StatBox = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #ffdd00;
`;

const StatLabel = styled.div`
  font-size: 16px;
  opacity: 0.8;
`;

const LoadingMessage = styled.div`
  text-align: center;
  opacity: 0.7;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  text-align: center;
  margin-top: 20px;
`;

const Home = () => {
  const [totalItems, setTotalItems] = useState(0);
  const [activeLoans, setActiveLoans] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeItems: () => void;
    let unsubscribeUsers: () => void;
    let unsubscribeReports: () => void;

    try {
      unsubscribeItems = onSnapshot(
        collection(db, "items"),
        (snapshot) => {
          console.log("Items snapshot:", snapshot.docs.length);
          setTotalItems(snapshot.size);
          setLoading(false);
        },
        (err) => {
          console.error("Items listener error:", err);
          setError("Failed to load items: " + err.message);
          setLoading(false);
        }
      );

      unsubscribeUsers = onSnapshot(
        collection(db, "users"),
        (snapshot) => {
          const rentals = snapshot.docs.flatMap((doc) => doc.data().rentals || []);
          console.log("Users snapshot - rentals:", rentals.length);
          setActiveLoans(rentals.length);
          setLoading(false);
        },
        (err) => {
          console.error("Users listener error:", err);
          setError("Failed to load users: " + err.message);
          setLoading(false);
        }
      );

      unsubscribeReports = onSnapshot(
        collection(db, "reports"),
        (snapshot) => {
          const pending = snapshot.docs.filter((doc) => doc.data().status === "pending").length;
          console.log("Reports snapshot - pending:", pending);
          setPendingReports(pending);
          setLoading(false);
        },
        (err) => {
          console.error("Reports listener error:", err);
          setError("Failed to load reports: " + err.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Setup error:", err);
      setError("Error setting up listeners: " + (err as Error).message);
      setLoading(false);
    }

    return () => {
      console.log("Cleaning up Home listeners");
      unsubscribeItems && unsubscribeItems();
      unsubscribeUsers && unsubscribeUsers();
      unsubscribeReports && unsubscribeReports();
    };
  }, []);

  if (loading) {
    return (
      <DashboardContainer>
        <Title>Admin Dashboard</Title>
        <LoadingMessage>Loading dashboard data...</LoadingMessage>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <Title>Admin Dashboard</Title>
        <ErrorMessage>{error}</ErrorMessage>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Title>Admin Dashboard</Title>
      <Description>Manage loans, inventory, and users efficiently.</Description>
      <StatsContainer>
        <StatBox>
          <StatNumber>{totalItems}</StatNumber>
          <StatLabel>Total Items</StatLabel>
        </StatBox>
        <StatBox>
          <StatNumber>{activeLoans}</StatNumber>
          <StatLabel>Active Loans</StatLabel>
        </StatBox>
        <StatBox>
          <StatNumber>{pendingReports}</StatNumber>
          <StatLabel>Pending Reports</StatLabel>
        </StatBox>
      </StatsContainer>
    </DashboardContainer>
  );
};

export default Home;