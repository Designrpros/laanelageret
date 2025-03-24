"use client";

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { CategoryFilterSection } from "../items/CategoryFilterSection"; // Adjust path as needed

// Interfaces (unchanged)
interface UserEntry {
  id: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  rentals: { itemId: string; name: string; quantity: number; date: string }[];
}

interface ItemEntry {
  id: string;
  name: string;
  createdAt: string;
  rented: number;
}

interface ReportEntry {
  id: string;
  userId: string;
  email: string;
  itemId: string;
  itemName: string;
  reportedAt: string;
  status: string;
}

interface HistoryEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  category: "user" | "item" | "rental" | "report";
}

// Styled Components (adjusted FilterContainer)
const HistoryContainer = styled.div`
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

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: clamp(15px, 3vw, 20px);
`;

const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const HistoryItem = styled.li<{ $category: string }>`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: clamp(10px, 2vw, 15px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.3s ease;
  background: ${({ $category }) =>
    $category === "rental" ? "#fff3f3" : $category === "report" ? "#f9f9f9" : "#fff"};

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const HistoryDetails = styled.div`
  font-size: clamp(12px, 2vw, 14px);
  color: #555;
`;

const HistoryTimestamp = styled.div`
  font-size: clamp(12px, 2vw, 14px);
  color: #888;
`;

const EmptyMessage = styled.p`
  font-size: clamp(14px, 2vw, 16px);
  color: #666;
  text-align: center;
  font-style: italic;
`;

const History = () => {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [items, setItems] = useState<ItemEntry[]>([]);
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const filterCategories = ["all", "user", "item", "rental", "report"]; // Options for the picker

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const fetchedUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email || "Unknown",
        createdAt: doc.data().createdAt || "",
        lastLogin: doc.data().lastLogin || "",
        rentals: doc.data().rentals || [],
      })) as UserEntry[];
      setUsers(fetchedUsers);
    });

    const unsubItems = onSnapshot(collection(db, "items"), (snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        createdAt: doc.data().createdAt || "",
        rented: doc.data().rented || 0,
      })) as ItemEntry[];
      setItems(fetchedItems);
    });

    const unsubReports = onSnapshot(collection(db, "reports"), (snapshot) => {
      const fetchedReports = snapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        email: doc.data().email,
        itemId: doc.data().itemId,
        itemName: doc.data().itemName,
        reportedAt: doc.data().reportedAt,
        status: doc.data().status,
      })) as ReportEntry[];
      setReports(fetchedReports);
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubItems();
      unsubReports();
    };
  }, []);

  const historyEntries = useMemo(() => {
    const entries: HistoryEntry[] = [];
    users.forEach((user) => {
      if (user.createdAt) {
        entries.push({
          id: `${user.id}-registered`,
          action: "User Registered",
          details: `${user.email} joined the platform`,
          timestamp: user.createdAt,
          category: "user",
        });
      }
    });
    items.forEach((item) => {
      if (item.createdAt) {
        entries.push({
          id: `${item.id}-added`,
          action: "Item Added",
          details: `${item.name} was added to inventory`,
          timestamp: item.createdAt,
          category: "item",
        });
      }
    });
    users.forEach((user) => {
      user.rentals.forEach((rental, index) => {
        entries.push({
          id: `${user.id}-rental-${index}`,
          action: "Rental",
          details: `${user.email} rented ${rental.name} (Qty: ${rental.quantity})`,
          timestamp: rental.date,
          category: "rental",
        });
      });
    });
    reports.forEach((report) => {
      entries.push({
        id: report.id,
        action: `Report (${report.status})`,
        details: `${report.email} reported ${report.itemName}`,
        timestamp: report.reportedAt,
        category: "report",
      });
    });
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [users, items, reports]);

  const filteredHistory = useMemo(() => {
    if (filter === "all") return historyEntries;
    return historyEntries.filter((entry) => entry.category === filter);
  }, [historyEntries, filter]);

  if (loading) return <HistoryContainer>Loading...</HistoryContainer>;

  return (
    <HistoryContainer>
      <Title>Activity History</Title>
      <FilterContainer>
        <CategoryFilterSection
          selectedCategory={filter}
          setSelectedCategory={setFilter}
          filterCategories={filterCategories}
        />
      </FilterContainer>
      {filteredHistory.length > 0 ? (
        <HistoryList>
          {filteredHistory.map((entry) => (
            <HistoryItem key={entry.id} $category={entry.category}>
              <HistoryDetails>
                <strong>{entry.action}</strong> - {entry.details}
              </HistoryDetails>
              <HistoryTimestamp>{new Date(entry.timestamp).toLocaleString()}</HistoryTimestamp>
            </HistoryItem>
          ))}
        </HistoryList>
      ) : (
        <EmptyMessage>No history entries found for this filter.</EmptyMessage>
      )}
    </HistoryContainer>
  );
};

export default History;