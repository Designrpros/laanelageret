"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { db } from "../../../firebase"; // Adjust path if needed
import { collection, onSnapshot } from "firebase/firestore";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend
);

const AnalyticsContainer = styled.div`
  background: #fff;
  padding: clamp(15px, 3vw, 30px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  font-family: "Helvetica", Arial, sans-serif;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Title = styled.h1`
  font-size: clamp(20px, 5vw, 32px);
  font-weight: bold;
  margin-bottom: clamp(15px, 3vw, 20px);
  text-align: center;
  color: #1a1a1a;
`;

const ChartWrapper = styled.div`
  margin-bottom: clamp(20px, 4vw, 30px);
  padding: clamp(10px, 2vw, 20px);
  background: #f9f9f9;
  border-radius: 8px;
  max-width: 100%;
  overflow-x: auto;

  h2 {
    font-size: clamp(16px, 3vw, 20px);
    margin-bottom: clamp(10px, 2vw, 15px);
    text-align: center;
    color: #1a1a1a;
  }

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: clamp(200px, 50vh, 300px); /* Scales between 200px and 300px based on viewport height */

  @media (max-width: 768px) {
    height: clamp(150px, 40vh, 250px); /* Smaller range for mobile */
  }
`;

const Analytics = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubReceipts = onSnapshot(collection(db, "receipts"), (snapshot) => {
      setReceipts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubItems = onSnapshot(collection(db, "items"), (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubReceipts();
      unsubItems();
      unsubUsers();
    };
  }, []);

  const timeChartData = () => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 29); // 30 days total

    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(last30Days);
      date.setDate(date.getDate() + i);
      return date.toISOString().split("T")[0];
    });

    const rentalsByDate = dates.map((date) => {
      return receipts.filter((r) => r.type === "rental" && r.date.startsWith(date)).length;
    });

    const returnsByDate = dates.map((date) => {
      return receipts.filter((r) => r.type === "return" && r.date.startsWith(date)).length;
    });

    return {
      labels: dates,
      datasets: [
        { label: "Rentals", data: rentalsByDate, borderColor: "#ff6384", backgroundColor: "rgba(255, 99, 132, 0.2)", fill: true },
        { label: "Returns", data: returnsByDate, borderColor: "#36a2eb", backgroundColor: "rgba(54, 162, 235, 0.2)", fill: true },
      ],
    };
  };

  const userChartData = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = users.filter((u) =>
      receipts.some((r) => r.userId === u.id && new Date(r.date) >= thirtyDaysAgo)
    ).length;
    const inactiveUsers = users.length - activeUsers;

    return {
      labels: ["Active Users (Last 30 Days)", "Inactive Users"],
      datasets: [
        {
          data: [activeUsers, inactiveUsers],
          backgroundColor: ["#ffcd56", "#e0e0e0"],
          borderColor: ["#ffcd56", "#e0e0e0"],
          borderWidth: 1,
        },
      ],
    };
  };

  const itemChartData = () => {
    const rentalCounts = receipts
      .filter((r) => r.type === "rental")
      .reduce((acc: { [key: string]: number }, r) => {
        acc[r.itemId] = (acc[r.itemId] || 0) + r.quantity;
        return acc;
      }, {});

    const topItems = Object.entries(rentalCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([itemId]) => {
        const item = items.find((i) => i.id === itemId);
        return item ? item.name : itemId;
      });

    const topCounts = Object.values(rentalCounts)
      .sort((a, b) => b - a)
      .slice(0, 5);

    return {
      labels: topItems,
      datasets: [
        {
          label: "Rental Count",
          data: topCounts,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "#4bc0c0",
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "top" as const,
        labels: {
          font: {
            size: window.innerWidth <= 768 ? 12 : 14, // Smaller on mobile
          },
        },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: { 
        display: true, 
        ticks: { 
          autoSkip: true, 
          maxTicksLimit: window.innerWidth <= 768 ? 10 : 30, // Fewer ticks on mobile
          maxRotation: window.innerWidth <= 768 ? 45 : 0, // Rotate labels on mobile
          minRotation: window.innerWidth <= 768 ? 45 : 0,
          font: {
            size: window.innerWidth <= 768 ? 10 : 12, // Smaller font on mobile
          },
        },
      },
      y: { 
        beginAtZero: true,
        ticks: {
          font: {
            size: window.innerWidth <= 768 ? 10 : 12,
          },
        },
      },
    },
  };

  if (loading) return <AnalyticsContainer><Title>Loading...</Title></AnalyticsContainer>;

  return (
    <AnalyticsContainer>
      <Title>Analytics</Title>

      <ChartWrapper>
        <h2>Rentals and Returns Over Time (Last 30 Days)</h2>
        <ChartContainer>
          <Line data={timeChartData()} options={chartOptions} />
        </ChartContainer>
      </ChartWrapper>

      <ChartWrapper>
        <h2>Top 5 Most-Rented Items</h2>
        <ChartContainer>
          <Bar data={itemChartData()} options={chartOptions} />
        </ChartContainer>
      </ChartWrapper>

      <ChartWrapper>
        <h2>User Activity</h2>
        <ChartContainer>
          <Pie data={userChartData()} options={chartOptions} />
        </ChartContainer>
      </ChartWrapper>
    </AnalyticsContainer>
  );
};

export default Analytics;