"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, DocumentSnapshot } from "firebase/firestore";

const FormContainer = styled.div`
  background: white;
  font-family: "Helvetica", Arial, sans-serif;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  color: #6b7280;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #1a1a1a;
  color: white;
  border: none;
  border-radius: 6px;
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
  background: ${({ overdue }) => (overdue ? "#fef2f2" : "#ffffff")};
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }
`;

const RentalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RentalDetails = styled.div`
  font-size: 0.9rem;
  color: #4b5563;
`;

const RentalTimestamp = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
`;

const OverdueBadge = styled.span`
  background: #ef4444;
  color: #fff;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.75rem;
  margin-left: 6px;
`;

const Dropdown = styled.div`
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  background: #fafafa;
`;

const DropdownRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.875rem;
  color: #4b5563;
`;

const Label = styled.span`
  font-weight: 500;
  color: #374151;
`;

interface Rental {
  itemId: string;
  name: string;
  quantity: number;
  date: string; // Rental start date
  dueDate?: string; // Due date (from receipts)
}

interface LogoutViewProps {
  user: any;
}

const LogoutView = ({ user }: LogoutViewProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("[LogoutView] Initializing for user:", user.email);
    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap: DocumentSnapshot) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const userRentals = (data.rentals || []).map((rental: any) => ({
            ...rental,
            dueDate: rental.dueDate || new Date(new Date(rental.date).setDate(new Date(rental.date).getDate() + 7)).toISOString(),
          }));
          console.log("[LogoutView] Fetched rentals:", userRentals);
          setRentals(userRentals);
        } else {
          console.warn("[LogoutView] User document not found for UID:", user.uid);
        }
      },
      (err) => {
        console.error("[LogoutView] Error fetching rentals:", err.message);
        setError("Kunne ikke hente utlån. Prøv igjen senere.");
      }
    );

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

  const isOverdue = (dueDate: string): boolean => {
    return Date.now() > new Date(dueDate).getTime();
  };

  return (
    <FormContainer>
      <WelcomeMessage>Velkommen, {user.email}!</WelcomeMessage>
      {rentals.length > 0 ? (
        <>
          <LogoutNote>Dine aktive utlån:</LogoutNote>
          <RentalsList>
            {rentals.map((rental) => {
              const overdue = isOverdue(rental.dueDate || rental.date);
              return (
                <RentalItem
                  key={rental.itemId}
                  overdue={overdue}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest(".dropdown") === null) {
                      setExpandedId(expandedId === rental.itemId ? null : rental.itemId);
                    }
                  }}
                >
                  <RentalHeader>
                    <RentalDetails>
                      {rental.name} ({rental.quantity})
                      {overdue && <OverdueBadge>Forfalt</OverdueBadge>}
                    </RentalDetails>
                    <RentalTimestamp>{new Date(rental.date).toLocaleDateString("no-NO")}</RentalTimestamp>
                  </RentalHeader>
                  {expandedId === rental.itemId && (
                    <Dropdown className="dropdown">
                      <DropdownRow>
                        <Label>Forfall:</Label>
                        <span>
                          {new Date(rental.dueDate || rental.date).toLocaleDateString("no-NO")}
                          {overdue && " (Forfalt)"}
                        </span>
                      </DropdownRow>
                    </Dropdown>
                  )}
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