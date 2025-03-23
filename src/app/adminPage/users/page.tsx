// src/app/adminPage/users/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { db, auth } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface Rental { itemId: string; name: string; quantity: number; date: string; }
interface CartItem { id: string; name: string; imageUrl: string; category: string; quantity: number; }
interface UserData { id: string; email: string; rentals: Rental[]; cart?: { items: CartItem[] }; lastLogin?: string; createdAt?: string; }

const Container = styled.div`
  padding: clamp(15px, 3vw, 30px);
  background: #fff;
  font-family: "Helvetica", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;

  @media (max-width: 768px) { padding: 15px; }
`;

const Title = styled.h1`
  font-size: clamp(20px, 5vw, 32px);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: clamp(10px, 2vw, 15px);
  text-align: center;
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

const UserList = styled.ul`
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const UserItem = styled.li`
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

const UserHeader = styled.div`
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

const UserEmail = styled.h3`
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

const UserDetails = styled.div<{ isOpen: boolean }>`
  max-height: ${({ isOpen }) => (isOpen ? "500px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: ${({ isOpen }) => (isOpen ? "clamp(10px, 2vw, 15px)" : "0 clamp(10px, 2vw, 15px)")};
`;

const DetailSection = styled.div`
  margin-top: clamp(0.5rem, 1vw, 1rem);
`;

const SectionLabel = styled.h4`
  font-size: clamp(14px, 2vw, 16px);
  color: #333;
  font-weight: 500;
  margin-bottom: clamp(0.25rem, 1vw, 0.5rem);
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

const EmptyMessage = styled.p`
  font-size: clamp(12px, 2vw, 16px);
  color: #666;
  font-style: italic;
`;

const Summary = styled.div`
  margin-top: clamp(15px, 3vw, 20px);
  text-align: center;
`;

const SummaryText = styled.p`
  font-size: clamp(14px, 2vw, 16px);
  color: #333;
`;

const Users = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [search, setSearch] = useState(""); // Add search state

  useEffect(() => {
    const currentUser = auth.currentUser;
    console.log("Current authenticated user:", currentUser ? { uid: currentUser.uid, email: currentUser.email } : "No user logged in");

    let timeout: NodeJS.Timeout;
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        console.log("Users snapshot received:", {
          size: snapshot.size,
          docs: snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() })),
          empty: snapshot.empty,
        });
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const fetchedUsers = snapshot.docs.map((doc) => ({
            id: doc.id,
            email: doc.data().email || "Unknown",
            rentals: doc.data().rentals || [],
            cart: doc.data().cart || { items: [] },
            lastLogin: doc.data().lastLogin || "",
            createdAt: doc.data().createdAt || "",
          })) as UserData[];
          console.log("Processed users:", fetchedUsers);
          setUsers(fetchedUsers);
          setLoading(false);
        }, 100);
      },
      (error) => {
        console.error("Snapshot error:", error);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const toggleUserDetails = (userId: string) => {
    setOpenUserId(openUserId === userId ? null : userId);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const totalRentals = useMemo(() => filteredUsers.reduce((sum, user) => sum + user.rentals.length, 0), [filteredUsers]);
  const totalCartItems = useMemo(
    () => filteredUsers.reduce((sum, user) => sum + (user.cart?.items || []).reduce((s, i) => s + i.quantity, 0), 0),
    [filteredUsers]
  );

  if (loading) return <Container><Title>Loading...</Title></Container>;

  return (
    <Container>
      <Title>All Users & Details</Title>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search by email or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchContainer>
      {filteredUsers.length > 0 ? (
        <>
          <UserList>
            {filteredUsers.map((user) => (
              <UserItem key={user.id}>
                <UserHeader onClick={() => toggleUserDetails(user.id)}>
                  <UserEmail>{user.email} (ID: {user.id})</UserEmail>
                  <ToggleButton>{openUserId === user.id ? "−" : "+"}</ToggleButton>
                </UserHeader>
                <UserDetails isOpen={openUserId === user.id}>
                  <DetailSection>
                    <SectionLabel>Rentals ({user.rentals.length})</SectionLabel>
                    <DetailList>
                      {user.rentals.length > 0 ? (
                        user.rentals.map((rental, idx) => (
                          <DetailItem key={idx}>
                            {rental.name} (Qty: {rental.quantity}) - Rented on{" "}
                            {new Date(rental.date).toLocaleString()}
                          </DetailItem>
                        ))
                      ) : (
                        <EmptyMessage>No rentals</EmptyMessage>
                      )}
                    </DetailList>
                  </DetailSection>
                  <DetailSection>
                    <SectionLabel>Cart ({user.cart?.items.length || 0})</SectionLabel>
                    <DetailList>
                      {user.cart && user.cart.items && user.cart.items.length > 0 ? (
                        user.cart.items.map((item, idx) => (
                          <DetailItem key={idx}>
                            {item.name} (Qty: {item.quantity})
                          </DetailItem>
                        ))
                      ) : (
                        <EmptyMessage>No items in cart</EmptyMessage>
                      )}
                    </DetailList>
                  </DetailSection>
                  <DetailSection>
                    <SectionLabel>Account Info</SectionLabel>
                    <DetailList>
                      <DetailItem>
                        Created: {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
                      </DetailItem>
                      <DetailItem>
                        Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "N/A"}
                      </DetailItem>
                    </DetailList>
                  </DetailSection>
                </UserDetails>
              </UserItem>
            ))}
          </UserList>
          <Summary>
            <SummaryText>Total Users: {filteredUsers.length}</SummaryText>
            <SummaryText>Total Rentals: {totalRentals}</SummaryText>
            <SummaryText>Total Cart Items: {totalCartItems}</SummaryText>
          </Summary>
        </>
      ) : (
        <p>No users found.</p>
      )}
    </Container>
  );
};

export default Users;