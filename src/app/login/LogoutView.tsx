"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase"; // Ensure db is exported from firebase.ts
import { useRouter } from "next/navigation";
import { doc, onSnapshot, DocumentSnapshot } from "firebase/firestore";

// Styled Components
const FormContainer = styled.div`
  background: white;
  font-family: "Helvetica", Arial, sans-serif;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const WelcomeMessage = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
  text-align: center;
  color: #1a1a1a;
`;

const LogoutNote = styled.p`
  font-size: 0.875rem;
  color: #666;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover:not(:disabled) {
    background-color: #333;
  }
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
  text-align: center;
`;

const RentalsList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
`;

const RentalItem = styled.li<{ overdue: boolean }>`
  font-size: 1rem;
  color: ${({ overdue }) => (overdue ? "#ef4444" : "#1a1a1a")}; // Red if overdue
  margin-bottom: 0.5rem;
`;

interface Rental {
  itemId: string;
  name: string;
  quantity: number;
  date: string; // ISO string (e.g., "2025-03-26T12:00:00Z")
}

interface LogoutViewProps {
  user: any; // Consider typing as firebase.User
}

const LogoutView = ({ user }: LogoutViewProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const router = useRouter();

  useEffect(() => {
    console.log("[LogoutView] Initializing for user:", user.email);
    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, (docSnap: DocumentSnapshot) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userRentals = data.rentals || [];
        console.log("[LogoutView] Fetched rentals:", userRentals);
        setRentals(userRentals);
      } else {
        console.warn("[LogoutView] User document not found for UID:", user.uid);
      }
    }, (err) => {
      console.error("[LogoutView] Error fetching rentals:", err.message);
      setError("Kunne ikke hente utlån. Prøv igjen senere.");
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      console.log("[LogoutView] User signed out");
      router.push("/login");
    } catch (error: any) {
      console.error("[LogoutView] Sign out error:", error);
      setError("Feil ved utlogging. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate due date (1 week after rental date)
  const isOverdue = (rentalDate: string): boolean => {
    const rentalTime = new Date(rentalDate).getTime();
    const dueTime = rentalTime + 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    return Date.now() > dueTime;
  };

  return (
    <FormContainer>
      <WelcomeMessage>Velkommen, {user.email}!</WelcomeMessage>
      {rentals.length > 0 ? (
        <>
          <LogoutNote>Dine aktive utlån:</LogoutNote>
          <RentalsList>
            {rentals.map((rental, idx) => {
              const dueDate = new Date(rental.date);
              dueDate.setDate(dueDate.getDate() + 7); // Due 1 week later
              const overdue = isOverdue(rental.date);
              return (
                <RentalItem key={idx} overdue={overdue}>
                  {rental.name} (Antall: {rental.quantity}) - Forfall: {dueDate.toLocaleDateString("no-NO")} 
                  {overdue && " (Forfalt)"}
                </RentalItem>
              );
            })}
          </RentalsList>
        </>
      ) : (
        <LogoutNote>Ingen aktive utlån for øyeblikket.</LogoutNote>
      )}
      <Button onClick={handleSignOut} disabled={loading}>
        {loading ? "Logger ut..." : "Logg ut"}
      </Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormContainer>
  );
};

export default LogoutView;