"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

const DashboardContainer = styled.div`
  background: #fff;
  padding: clamp(10px, 2vw, 20px);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 100%; /* Prevent overflow */
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Title = styled.h1`
  font-size: clamp(16px, 4vw, 28px);
  font-weight: bold;
  margin-bottom: clamp(10px, 2vw, 15px);
  text-align: center;
  color: #1a1a1a;

  @media (max-width: 480px) {
    font-size: clamp(14px, 3vw, 20px);
  }
`;

const StatsContainer = styled.div`
  display: flex;
  flex-wrap: wrap; /* Switch to flex for better control */
  gap: clamp(10px, 2vw, 15px);
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const StatBox = styled.div`
  background: #f9f9f9;
  padding: clamp(10px, 2vw, 15px);
  border-radius: 6px;
  text-align: center;
  flex: 1 1 150px; /* Grow/shrink, min 150px */
  max-width: 200px; /* Cap width */
  box-sizing: border-box;

  @media (max-width: 768px) {
    max-width: 100%; /* Full width on mobile */
  }
`;

const StatNumber = styled.div`
  font-size: clamp(18px, 3vw, 22px);
  font-weight: bold;
  color: #ffdd00;
`;

const StatLabel = styled.div`
  font-size: clamp(12px, 2vw, 14px);
  color: #555;
`;

export default function Home() {
  const [totalItems, setTotalItems] = useState(0);
  const [activeLoans, setActiveLoans] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const unsubItems = onSnapshot(collection(db, "items"), (snapshot) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setTotalItems(snapshot.size);
        setLoading(false);
      }, 100);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const rentals = snapshot.docs.flatMap((doc) => doc.data().rentals || []);
        setActiveLoans(rentals.length);
      }, 100);
    });

    const unsubReports = onSnapshot(collection(db, "reports"), (snapshot) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const pending = snapshot.docs.filter((doc) => doc.data().status === "pending").length;
        setPendingReports(pending);
      }, 100);
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
}