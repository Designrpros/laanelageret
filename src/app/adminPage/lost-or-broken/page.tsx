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
  location: string;
  isAdminReport?: boolean; // New field
}

const Container = styled.div`
  padding: clamp(10px, 2vw, 20px);
  font-family: "Helvetica", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  box-sizing: border-box;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Title = styled.h1`
  font-size: clamp(18px, 4vw, 32px);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: clamp(10px, 2vw, 15px);
  text-align: center;

  @media (max-width: 480px) {
    font-size: clamp(16px, 3vw, 24px);
  }
`;

const SearchContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin-bottom: clamp(15px, 3vw, 20px);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: clamp(8px, 1.5vw, 12px);
  font-size: clamp(14px, 2vw, 16px);
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #1a1a1a;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  }
`;

const ReportList = styled.ul`
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ReportItem = styled.li`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(10px, 2vw, 15px);
  cursor: pointer;
  background: #f9f9f9;

  &:hover {
    background: #f0f0f0;
  }
`;

const ReportTitle = styled.h3`
  font-size: clamp(16px, 3vw, 18px);
  color: #1a1a1a;
  font-weight: 600;
  margin: 0;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  font-size: clamp(14px, 2vw, 16px);
  color: #555;
  cursor: pointer;
  padding: 0 10px;
`;

const ReportDetails = styled.div<{ isOpen: boolean }>`
  max-height: ${({ isOpen }) => (isOpen ? "500px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: ${({ isOpen }) => (isOpen ? "clamp(10px, 2vw, 15px)" : "0 clamp(10px, 2vw, 15px)")};
`;

const DetailList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const DetailItem = styled.li`
  font-size: clamp(12px, 2vw, 14px);
  color: #555;
  padding: clamp(0.25rem, 1vw, 0.5rem) 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  font-size: clamp(10px, 2vw, 14px);
  color: #fff;
  background: ${({ $status }) => ($status === "pending" ? "#ff4444" : "#28a745")};
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-block;
  margin-top: 0.5rem;
`;

const AdminBadge = styled.span`
  font-size: clamp(10px, 2vw, 14px);
  color: #fff;
  background: #1a73e8; /* Blue for admin */
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-block;
  margin-left: 8px;
`;

const ResolveButton = styled.button`
  margin-top: 1rem;
  padding: clamp(6px, 1vw, 8px) clamp(10px, 2vw, 16px);
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: clamp(12px, 2vw, 16px);

  &:hover {
    background: #333;
  }
`;

const LostOrBroken = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const locations = [
    { id: 1, name: "Stabekk", lat: 59.90921845652782, lng: 10.611649286507243 },
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {
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
        location: doc.data().location || "Stabekk",
        isAdminReport: doc.data().isAdminReport || false, // Default to false if missing
      }) as Report).sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
      setReports(fetchedReports);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleReportDetails = (reportId: string) => {
    setOpenReportId(openReportId === reportId ? null : reportId);
  };

  const filteredReports = useMemo(() => {
    return reports.filter(
      (report) =>
        report.itemName.toLowerCase().includes(search.toLowerCase()) ||
        report.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [reports, search]);

  const handleResolve = async (reportId: string) => {
    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, { status: "resolved" });
      alert("Rapport markert som løst!");
    } catch (error) {
      console.error("Feil ved løsning av rapport:", error);
      alert("Kunne ikke løse rapporten.");
    }
  };

  if (loading) return <Container><Title>Laster...</Title></Container>;

  return (
    <Container>
      <Title>Mistet eller ødelagt</Title>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Søk etter gjenstand eller e-post..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchContainer>
      {filteredReports.length > 0 ? (
        <ReportList>
          {filteredReports.map((report) => (
            <ReportItem key={report.id}>
              <ReportHeader onClick={() => toggleReportDetails(report.id)}>
                <ReportTitle>
                  {report.itemName} ({report.email}) - {report.location}
                  {report.isAdminReport && <AdminBadge>Admin</AdminBadge>}
                </ReportTitle>
                <ToggleButton>{openReportId === report.id ? "−" : "+"}</ToggleButton>
              </ReportHeader>
              <ReportDetails isOpen={openReportId === report.id}>
                <DetailList>
                  <DetailItem>ID: {report.id}</DetailItem>
                  <DetailItem>Bruker-ID: {report.userId}</DetailItem>
                  <DetailItem>Gjenstand-ID: {report.itemId}</DetailItem>
                  <DetailItem>Antall: {report.quantity}</DetailItem>
                  <DetailItem>Utleid: {new Date(report.dateRented).toLocaleString()}</DetailItem>
                  <DetailItem>Rapportert: {new Date(report.reportedAt).toLocaleString()}</DetailItem>
                  <DetailItem>Problem: {report.reportDetails}</DetailItem>
                  <DetailItem>Lokasjon: {report.location}</DetailItem>
                </DetailList>
                <StatusBadge $status={report.status}>{report.status === "pending" ? "Venter" : "Løst"}</StatusBadge>
                {report.status === "pending" && (
                  <ResolveButton onClick={() => handleResolve(report.id)}>Løs</ResolveButton>
                )}
              </ReportDetails>
            </ReportItem>
          ))}
        </ReportList>
      ) : (
        <p>Ingen rapporterte gjenstander funnet.</p>
      )}
    </Container>
  );
};

export default LostOrBroken;