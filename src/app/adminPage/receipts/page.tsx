"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { db } from "../../../firebase";
import { collection, onSnapshot, doc, updateDoc, getDoc, addDoc } from "firebase/firestore";

interface Receipt {
  id: string;
  userId: string;
  email: string;
  itemId: string;
  itemName: string;
  quantity: number;
  date: string;
  type: "rental" | "return";
  location: string;
  dueDate?: string;
  reportStatus?: "okay" | "not_okay";
  reportDetails?: string;
}

const Container = styled.div`
  background: #fff;
  padding: clamp(16px, 3vw, 24px);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: clamp(300px, 90vw, 900px); /* Responsive width */
  margin: 0 auto;
  font-family: "Helvetica", Arial, sans-serif;
`;

const Title = styled.h1`
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: clamp(12px, 2vw, 20px);
`;

const ReceiptList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ReceiptItem = styled.li<{ $type: string; $isOverdue?: boolean }>`
  background: ${({ $type, $isOverdue }) =>
    $isOverdue && $type === "rental" ? "#fef2f2" : $type === "rental" ? "#ffffff" : "#f7faf7"};
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: clamp(6px, 1vw, 8px);
  padding: clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px);
  cursor: pointer;
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }
`;

const ReceiptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* Allow wrapping on small screens */
  gap: clamp(8px, 1vw, 12px);
`;

const ReceiptDetails = styled.div`
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  color: #4b5563;
  flex: 1;
  min-width: 0; /* Prevent overflow */
`;

const ReceiptTimestamp = styled.div`
  font-size: clamp(0.75rem, 1.5vw, 0.85rem);
  color: #6b7280;
`;

const OverdueBadge = styled.span`
  background: #ef4444;
  color: #fff;
  padding: clamp(2px, 0.5vw, 4px) clamp(4px, 1vw, 6px);
  border-radius: 10px;
  font-size: clamp(0.65rem, 1.5vw, 0.75rem);
  margin-left: clamp(4px, 1vw, 6px);
`;

const Dropdown = styled.div`
  padding: clamp(12px, 2vw, 16px);
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  background: #fafafa;
`;

const DropdownRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(8px, 1.5vw, 12px);
  font-size: clamp(0.8rem, 2vw, 0.875rem);
  color: #4b5563;
  flex-wrap: wrap; /* Responsive wrapping */
  gap: clamp(6px, 1vw, 10px);
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(8px, 1.5vw, 12px);
  gap: clamp(6px, 1vw, 10px);
  flex-wrap: wrap; /* Responsive wrapping */
`;

const Label = styled.span`
  font-weight: 500;
  color: #374151;
  flex-shrink: 0;
`;

const Input = styled.input`
  padding: clamp(4px, 1vw, 6px) clamp(8px, 1.5vw, 10px);
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: clamp(0.8rem, 2vw, 0.875rem);
  width: clamp(60px, 15vw, 80px);
  background: #fff;
  transition: border-color 0.2s;
  &:focus {
    border-color: #1a1a1a;
    outline: none;
  }
`;

const Select = styled.select`
  padding: clamp(4px, 1vw, 6px) clamp(8px, 1.5vw, 10px);
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: clamp(0.8rem, 2vw, 0.875rem);
  width: clamp(90px, 20vw, 120px);
  background: #fff;
  transition: border-color 0.2s;
  &:focus {
    border-color: #1a1a1a;
    outline: none;
  }
`;

const ActionButton = styled.button`
  padding: clamp(4px, 1vw, 6px) clamp(8px, 1.5vw, 12px);
  background-color: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #333;
  }
`;

const ReportSection = styled.div<{ $isOpen: boolean }>`
  max-height: ${({ $isOpen }) => ($isOpen ? "200px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const ReportToggleButton = styled.button`
  padding: clamp(4px, 1vw, 6px) clamp(8px, 1.5vw, 12px);
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  color: #4b5563;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  &:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
  }
`;

const ReportTextarea = styled.textarea`
  padding: clamp(6px, 1vw, 8px);
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: clamp(0.8rem, 2vw, 0.875rem);
  width: 100%;
  min-height: clamp(60px, 15vw, 80px);
  resize: vertical;
  background: #fff;
  margin-top: clamp(6px, 1vw, 8px);
  transition: border-color 0.2s;
  &:focus {
    border-color: #1a1a1a;
    outline: none;
  }
`;

const ReportSelect = styled.select`
  padding: clamp(4px, 1vw, 6px) clamp(8px, 1.5vw, 10px);
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: clamp(0.8rem, 2vw, 0.875rem);
  width: clamp(90px, 20vw, 120px);
  background: #fff;
  margin-top: clamp(6px, 1vw, 8px);
  transition: border-color 0.2s;
  &:focus {
    border-color: #1a1a1a;
    outline: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: clamp(0.7rem, 1.5vw, 0.8rem);
  margin-top: clamp(6px, 1vw, 8px);
  text-align: center;
`;

const EmptyMessage = styled.p`
  font-size: clamp(0.9rem, 2vw, 1rem);
  color: #6b7280;
  text-align: center;
  font-style: italic;
  margin-top: clamp(12px, 2vw, 20px);
`;

const Receipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reportDetails, setReportDetails] = useState<{ [key: string]: string }>({});
  const [reportStatus, setReportStatus] = useState<{ [key: string]: "okay" | "not_okay" | "" }>({});
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [reportOpen, setReportOpen] = useState<{ [key: string]: boolean }>({});

  const locations = [
    { id: 1, name: "Stabekk", lat: 59.90921845652782, lng: 10.611649286507243 },
    { id: 2, name: "Oslo", lat: 59.9139, lng: 10.7522 },
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "receipts"),
      (snapshot) => {
        const fetchedReceipts = snapshot.docs.map((doc) => ({
          id: doc.id,
          userId: doc.data().userId,
          email: doc.data().email,
          itemId: doc.data().itemId,
          itemName: doc.data().itemName,
          quantity: doc.data().quantity,
          date: doc.data().date,
          type: doc.data().type,
          location: doc.data().location || "Stabekk",
          dueDate:
            doc.data().dueDate ||
            new Date(new Date(doc.data().date).setDate(new Date(doc.data().date).getDate() + 7)).toISOString(),
          reportStatus: doc.data().reportStatus || "",
          reportDetails: doc.data().reportDetails || "",
        })) as Receipt[];
        console.log("[Receipts] Fetched receipts:", fetchedReceipts);
        setReceipts(fetchedReceipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setLoading(false);
      },
      (error) => {
        console.error("[Receipts] Error fetching receipts:", error);
        setErrors({ global: "Kunne ikke laste kvitteringer: " + error.message });
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const isOverdue = (receipt: Receipt): boolean => {
    if (receipt.type === "return") return false;
    const dueTime = new Date(receipt.dueDate || new Date(receipt.date).setDate(new Date(receipt.date).getDate() + 7)).getTime();
    return Date.now() > dueTime;
  };

  const extendDueDate = async (receipt: Receipt, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentDueDate = new Date(receipt.dueDate || new Date(receipt.date).setDate(new Date(receipt.date).getDate() + 7));
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(newDueDate.getDate() + 7);
    const updatedReceipt = { ...receipt, dueDate: newDueDate.toISOString() };

    try {
      const receiptRef = doc(db, "receipts", receipt.id);
      await updateDoc(receiptRef, { dueDate: updatedReceipt.dueDate });

      const userRef = doc(db, "users", receipt.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedRentals = (userData.rentals || []).map((rental: any) =>
          rental.itemId === receipt.itemId ? { ...rental, dueDate: newDueDate.toISOString() } : rental
        );
        await updateDoc(userRef, { rentals: updatedRentals });
        console.log("[Receipts] Updated users.rentals for:", receipt.itemName);
      }

      console.log("[Receipts] Extended due date for:", receipt.itemName);
      setReceipts((prev) => prev.map((r) => (r.id === receipt.id ? updatedReceipt : r)));
      setErrors((prev) => ({ ...prev, [receipt.id]: null }));
    } catch (err) {
      console.error("[Receipts] Error extending due date:", err);
      setErrors((prev) => ({ ...prev, [receipt.id]: "Kunne ikke forlenge frist." }));
    }
  };

  const shortenDueDate = async (receipt: Receipt, e: React.MouseEvent) => {
    e.stopPropagation();
    const originalDate = new Date(receipt.date);
    const minDueDate = new Date(originalDate);
    minDueDate.setDate(minDueDate.getDate() + 7);
    const currentDueDate = new Date(receipt.dueDate || minDueDate);
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(newDueDate.getDate() - 7);

    if (newDueDate < minDueDate) {
      setErrors((prev) => ({ ...prev, [receipt.id]: "Kan ikke forkorte før 1 uke fra utleie." }));
      return;
    }

    const updatedReceipt = { ...receipt, dueDate: newDueDate.toISOString() };

    try {
      const receiptRef = doc(db, "receipts", receipt.id);
      await updateDoc(receiptRef, { dueDate: updatedReceipt.dueDate });

      const userRef = doc(db, "users", receipt.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedRentals = (userData.rentals || []).map((rental: any) =>
          rental.itemId === receipt.itemId ? { ...rental, dueDate: newDueDate.toISOString() } : rental
        );
        await updateDoc(userRef, { rentals: updatedRentals });
        console.log("[Receipts] Updated users.rentals for:", receipt.itemName);
      }

      console.log("[Receipts] Shortened due date for:", receipt.itemName);
      setReceipts((prev) => prev.map((r) => (r.id === receipt.id ? updatedReceipt : r)));
      setErrors((prev) => ({ ...prev, [receipt.id]: null }));
    } catch (err) {
      console.error("[Receipts] Error shortening due date:", err);
      setErrors((prev) => ({ ...prev, [receipt.id]: "Kunne ikke forkorte frist." }));
    }
  };

  const updateReceipt = async (receiptId: string, updates: Partial<Receipt>) => {
    try {
      const receiptRef = doc(db, "receipts", receiptId);
      await updateDoc(receiptRef, updates);
      console.log("[Receipts] Updated receipt:", receiptId, updates);
      setReceipts((prev) => prev.map((r) => (r.id === receiptId ? { ...r, ...updates } : r)));
      setErrors((prev) => ({ ...prev, [receiptId]: null }));
    } catch (err) {
      console.error("[Receipts] Error updating receipt:", err);
      setErrors((prev) => ({ ...prev, [receiptId]: "Kunne ikke oppdatere kvittering." }));
    }
  };

  const handleReportSubmit = async (receipt: Receipt, e: React.MouseEvent) => {
    e.stopPropagation();
    const status = reportStatus[receipt.id] || "";
    const details = reportDetails[receipt.id] || "";
    if (!status) {
      setErrors((prev) => ({ ...prev, [receipt.id]: "Velg en status før du sender." }));
      return;
    }

    try {
      await updateReceipt(receipt.id, { reportStatus: status, reportDetails: details });

      const reportData = {
        userId: receipt.userId,
        email: receipt.email,
        itemId: receipt.itemId,
        itemName: receipt.itemName,
        quantity: receipt.quantity,
        dateRented: receipt.date,
        reportDetails: details,
        reportedAt: new Date().toISOString(),
        status: "pending",
        location: receipt.location,
        isAdminReport: true,
      };
      await addDoc(collection(db, "reports"), reportData);
      console.log("[Receipts] Report added to reports collection:", reportData);

      setReportOpen((prev) => ({ ...prev, [receipt.id]: false }));
    } catch (err) {
      console.error("[Receipts] Error submitting report:", err);
      setErrors((prev) => ({ ...prev, [receipt.id]: "Kunne ikke sende rapport." }));
    }
  };

  if (loading) return <Container><Title>Laster...</Title></Container>;
  if (errors.global) return <Container><Title>{errors.global}</Title></Container>;

  return (
    <Container>
      <Title>Kvitteringer</Title>
      {receipts.length > 0 ? (
        <ReceiptList>
          {receipts.map((receipt) => {
            const overdue = isOverdue(receipt);
            const dueDate = new Date(receipt.dueDate || new Date(receipt.date).setDate(new Date(receipt.date).getDate() + 7));

            return (
              <ReceiptItem
                key={receipt.id}
                $type={receipt.type}
                $isOverdue={overdue}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest(".dropdown") === null) {
                    setExpandedId(expandedId === receipt.id ? null : receipt.id);
                  }
                }}
              >
                <ReceiptHeader>
                  <ReceiptDetails>
                    {receipt.itemName} ({receipt.quantity}) - {receipt.email} -{" "}
                    {receipt.type === "rental" ? "Utleid" : "Returnert"}
                    {overdue && receipt.type === "rental" && <OverdueBadge>Forfalt</OverdueBadge>}
                  </ReceiptDetails>
                  <ReceiptTimestamp>{new Date(receipt.date).toLocaleDateString("no-NO")}</ReceiptTimestamp>
                </ReceiptHeader>
                {expandedId === receipt.id && (
                  <Dropdown className="dropdown">
                    {receipt.type === "rental" && (
                      <>
                        <DropdownRow>
                          <Label>Forfall:</Label>
                          <span>
                            {dueDate.toLocaleDateString("no-NO")}
                            {overdue && " (Forfalt)"}
                          </span>
                        </DropdownRow>
                        <ButtonRow>
                          <ActionButton onClick={(e) => shortenDueDate(receipt, e)}>– 1 uke</ActionButton>
                          <ActionButton onClick={(e) => extendDueDate(receipt, e)}>+ 1 uke</ActionButton>
                        </ButtonRow>
                      </>
                    )}
                    <DropdownRow>
                      <Label>Antall:</Label>
                      <Input
                        type="number"
                        value={receipt.quantity}
                        min={1}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateReceipt(receipt.id, { quantity: parseInt(e.target.value) || 1 });
                        }}
                      />
                    </DropdownRow>
                    <DropdownRow>
                      <Label>Lokasjon:</Label>
                      <Select
                        value={receipt.location}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateReceipt(receipt.id, { location: e.target.value });
                        }}
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.name}>
                            {loc.name}
                          </option>
                        ))}
                      </Select>
                    </DropdownRow>
                    {/* Status and Report for both rental and return */}
                    <DropdownRow>
                      <Label>Status:</Label>
                      <ReportSelect
                        value={reportStatus[receipt.id] || receipt.reportStatus || ""}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          setReportStatus((prev) => ({
                            ...prev,
                            [receipt.id]: e.target.value as "okay" | "not_okay" | "",
                          }));
                        }}
                      >
                        <option value="">Velg</option>
                        <option value="okay">Okay</option>
                        <option value="not_okay">Ikke Okay</option>
                      </ReportSelect>
                    </DropdownRow>
                    <ButtonRow>
                      <ReportToggleButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportOpen((prev) => ({
                            ...prev,
                            [receipt.id]: !prev[receipt.id],
                          }));
                        }}
                      >
                        {reportOpen[receipt.id] ? "Skjul rapport" : "Legg til rapport"}
                      </ReportToggleButton>
                      <ActionButton onClick={(e) => handleReportSubmit(receipt, e)}>
                        Lagre
                      </ActionButton>
                    </ButtonRow>
                    <ReportSection $isOpen={reportOpen[receipt.id] || false}>
                      <ReportTextarea
                        value={reportDetails[receipt.id] || receipt.reportDetails || ""}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          setReportDetails((prev) => ({ ...prev, [receipt.id]: e.target.value }));
                        }}
                        placeholder="Beskriv tilstand"
                      />
                    </ReportSection>
                    {errors[receipt.id] && <ErrorMessage>{errors[receipt.id]}</ErrorMessage>}
                  </Dropdown>
                )}
              </ReceiptItem>
            );
          })}
        </ReceiptList>
      ) : (
        <EmptyMessage>Ingen kvitteringer funnet.</EmptyMessage>
      )}
    </Container>
  );
};

export default Receipts;