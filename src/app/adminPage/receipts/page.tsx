"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface Receipt {
  id: string;
  userId: string;
  email: string;
  itemId: string;
  itemName: string;
  quantity: number;
  date: string;
  type: "rental" | "return";
}

const Container = styled.div`
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

const ReceiptList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ReceiptItem = styled.li<{ $type: string }>`
  background: ${({ $type }) => ($type === "rental" ? "#fff3f3" : "#f0fff0")};
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: clamp(10px, 2vw, 15px);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const ReceiptDetails = styled.div`
  font-size: clamp(12px, 2vw, 14px);
  color: #555;
`;

const ReceiptTimestamp = styled.div`
  font-size: clamp(12px, 2vw, 14px);
  color: #888;
`;

const EmptyMessage = styled.p`
  font-size: clamp(14px, 2vw, 16px);
  color: #666;
  text-align: center;
  font-style: italic;
`;

const Receipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state

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
        })) as Receipt[];
        console.log("[Receipts] Fetched receipts:", fetchedReceipts);
        setReceipts(fetchedReceipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setLoading(false);
      },
      (error) => {
        console.error("[Receipts] Error fetching receipts:", error);
        setError("Failed to load receipts: " + error.message);
        setLoading(false); // Ensure loading clears even on error
      }
    );
    return () => unsubscribe();
  }, []);

  if (loading) return <Container><Title>Loading...</Title></Container>;
  if (error) return <Container><Title>{error}</Title></Container>;

  return (
    <Container>
      <Title>Rental Receipts</Title>
      {receipts.length > 0 ? (
        <ReceiptList>
          {receipts.map((receipt) => (
            <ReceiptItem key={receipt.id} $type={receipt.type}>
              <ReceiptDetails>
                {receipt.email} - {receipt.itemName} (Qty: {receipt.quantity}) -{" "}
                {receipt.type === "rental" ? "Rented" : "Returned"}
              </ReceiptDetails>
              <ReceiptTimestamp>{new Date(receipt.date).toLocaleString()}</ReceiptTimestamp>
            </ReceiptItem>
          ))}
        </ReceiptList>
      ) : (
        <EmptyMessage>No receipts found.</EmptyMessage>
      )}
    </Container>
  );
};

export default Receipts;