"use client";

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { db, auth } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

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
  min-height: 100vh;
  padding: 4rem 2rem;
  background: #fff;
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
  text-align: center;
`;

const UserGrid = styled.div`
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const UserCard = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
`;

const UserEmail = styled.h3`
  font-size: 1.5rem;
  color: #1a1a1a;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const RentalList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RentalItem = styled.li`
  font-size: 1rem;
  color: #555;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const EmptyMessage = styled.p`
  font-size: 1rem;
  color: #666;
  font-style: italic;
`;

const Users = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/login?returnTo=/users");
      return;
    }

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
  }, [router]);

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