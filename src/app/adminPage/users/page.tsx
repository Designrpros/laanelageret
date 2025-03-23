"use client";

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface Rental {
  itemId: string;
  name: string;
  quantity: number;
  date: string;
}

interface UserData {
  id: string;
  email: string;
  rentals: Rental[];
}

const Container = styled.div`
  padding: clamp(10px, 2vw, 20px);
  background: #fff;
  font-family: "Helvetica", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Title = styled.h1`
  font-size: clamp(18px, 4vw, 32px);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: clamp(10px, 2vw, 20px);
  text-align: center;

  @media (max-width: 480px) {
    font-size: clamp(16px, 3vw, 24px);
  }
`;

const UserGrid = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: clamp(10px, 2vw, 15px);
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const UserCard = styled.div`
  background: #fff;
  padding: clamp(10px, 2vw, 15px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 300px;
  box-sizing: border-box;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const UserEmail = styled.h3`
  font-size: clamp(14px, 3vw, 18px);
  color: #1a1a1a;
  font-weight: 600;
  margin-bottom: clamp(0.5rem, 1vw, 1rem);
`;

const RentalList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RentalItem = styled.li`
  font-size: clamp(12px, 2vw, 16px);
  color: #555;
  padding: clamp(0.25rem, 1vw, 0.5rem) 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const EmptyMessage = styled.p`
  font-size: clamp(12px, 2vw, 16px);
  color: #666;
  font-style: italic;
`;

const Users = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const fetchedUsers = snapshot.docs.map((doc) => ({
            id: doc.id,
            email: doc.data().email || "Unknown",
            rentals: doc.data().rentals || [],
          })) as UserData[];
          setUsers(fetchedUsers);
          setLoading(false);
        }, 100);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const memoizedUsers = useMemo(() => users, [users]);

  if (loading) return <Container><Title>Loading...</Title></Container>;

  return (
    <Container>
      <Title>All Users & Rentals</Title>
      {memoizedUsers.length > 0 ? (
        <UserGrid>
          {memoizedUsers.map((user) => (
            <UserCard key={user.id}>
              <UserEmail>{user.email}</UserEmail>
              <RentalList>
                {user.rentals.length > 0 ? (
                  user.rentals.map((rental, idx) => (
                    <RentalItem key={idx}>
                      {rental.name} (Qty: {rental.quantity}) - Rented on{" "}
                      {new Date(rental.date).toLocaleDateString()}
                    </RentalItem>
                  ))
                ) : (
                  <EmptyMessage>No rentals</EmptyMessage>
                )}
              </RentalList>
            </UserCard>
          ))}
        </UserGrid>
      ) : (
        <p>No users found.</p>
      )}
    </Container>
  );
};

export default Users;