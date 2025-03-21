"use client";

import React from "react";
import styled from "styled-components";

const DashboardContainer = styled.div`
  font-family: "Helvetica", Arial, sans-serif;
  background-color: #333;
  padding: 30px;
  border-radius: 12px;
  color: white;
  max-width: 800px;
  margin: 40px auto;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Description = styled.p`
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 20px;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
`;

const StatBox = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 22px;
  font-weight: bold;
  color: #ffdd00;
`;

const StatLabel = styled.div`
  font-size: 14px;
  opacity: 0.8;
`;

const Home = () => {
  return (
    <DashboardContainer>
      <Title>Admin Dashboard</Title>
      <Description>Welcome! Manage loans, inventory, and users efficiently.</Description>

      <StatsContainer>
        <StatBox>
          <StatNumber>120</StatNumber>
          <StatLabel>Total Items</StatLabel>
        </StatBox>
        <StatBox>
          <StatNumber>45</StatNumber>
          <StatLabel>Active Loans</StatLabel>
        </StatBox>
        <StatBox>
          <StatNumber>8</StatNumber>
          <StatLabel>Pending Returns</StatLabel>
        </StatBox>
      </StatsContainer>
    </DashboardContainer>
  );
};

export default Home;