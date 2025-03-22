"use client";

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { db } from "../../../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

interface Report {
  id: string;
  userId: string;
  email: string;
  itemId: string;
  itemName: string;
  quantity: number;
  dateRented: string;
  reportDetails: string;
  reportedAt: string;
  status: string;
}

const Container = styled.div`
  min-height: 100vh;
  padding: 4rem 2rem;
  font-family: "Helvetica", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
`;

const ReportGrid = styled.div`
  width: 100%;
  max-width: 1000px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ReportCard = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ReportHeader = styled.h3`
  font-size: 1.25rem;
  color: #1a1a1a;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const ReportDetail = styled.p`
  font-size: 1rem;
  color: #555;
  margin: 0.25rem 0;
`;

const StatusBadge = styled.span<{ $status: string }>` // Changed to $status
  font-size: 0.9rem;
  color: #fff;
  background: ${({ $status }) => ($status === "pending" ? "#ff4444" : "#1a1a1a")};
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-block;
  margin-top: 0.5rem;
`;

const ResolveButton = styled.button`
  margin-top: 1rem;
  padding: 8px 16px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #333;
  }
`;

const LostOrBroken = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const unsubscribe = onSnapshot(
      collection(db, "reports"),
      (snapshot) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const fetchedReports = snapshot.docs.map((doc) => ({
            id: doc.id,
            userId: doc.data().userId,
            email: doc.data().email,
            itemId: doc.data().itemId,
            itemName: doc.data().itemName,
            quantity: doc.data().quantity,
            dateRented: doc.data().dateRented,
            reportDetails: doc.data().reportDetails,
            reportedAt: doc.data().reportedAt,
            status: doc.data().status,
          })) as Report[];
          setReports(fetchedReports);
          setLoading(false);
        }, 100);
      },
      (error) => {
        console.error("Error fetching reports:", error);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const memoizedReports = useMemo(() => reports, [reports]);

  const handleResolve = async (reportId: string) => {
    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, { status: "resolved" });
      alert("Report marked as resolved!");
    } catch (error) {
      console.error("Error resolving report:", error);
      alert("Failed to resolve report.");
    }
  };

  if (loading) return <Container><Title>Loading...</Title></Container>;

  return (
    <Container>
      <Title>Lost or Broken Items</Title>
      {memoizedReports.length > 0 ? (
        <ReportGrid>
          {memoizedReports.map((report) => (
            <ReportCard key={report.id}>
              <ReportHeader>{report.itemName}</ReportHeader>
              <ReportDetail>User: {report.email}</ReportDetail>
              <ReportDetail>Qty: {report.quantity}</ReportDetail>
              <ReportDetail>Rented: {new Date(report.dateRented).toLocaleDateString()}</ReportDetail>
              <ReportDetail>Reported: {new Date(report.reportedAt).toLocaleDateString()}</ReportDetail>
              <ReportDetail>Issue: {report.reportDetails}</ReportDetail>
              <StatusBadge $status={report.status}>{report.status}</StatusBadge>
              {report.status === "pending" && (
                <ResolveButton onClick={() => handleResolve(report.id)}>Resolve</ResolveButton>
              )}
            </ReportCard>
          ))}
        </ReportGrid>
      ) : (
        <p>No reported items found.</p>
      )}
    </Container>
  );
};

export default LostOrBroken;