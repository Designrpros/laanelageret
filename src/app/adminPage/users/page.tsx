"use client";

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { CategoryFilterSection } from "../items/CategoryFilterSection"; // Adjust path as needed

// Interfaces (updated, removed cart)
interface Rental { itemId: string; name: string; quantity: number; date: string; location: string; }
interface UserData { 
  id: string; 
  email: string; 
  rentals: Rental[]; 
  lastLogin?: string; 
  createdAt?: string; 
}

// Styled Components (unchanged)
const Container = styled.div`
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

const SearchContainer = styled.div`
  margin-bottom: clamp(15px, 3vw, 20px);
  width: 100%;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: clamp(8px, 1.5vw, 12px);
  font-size: clamp(14px, 2vw, 16px);
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: clamp(15px, 3vw, 20px);
`;

const StatusBadge = styled.span<{ $hasRentals: boolean }>`
  font-size: clamp(10px, 2vw, 12px);
  color: #fff;
  background: ${({ $hasRentals }) => ($hasRentals ? "#ff4444" : "#1a1a1a")};
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 10px;
`;

const UserList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const UserItem = styled.li`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const UserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(10px, 2vw, 15px);
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #f9f9f9;
  }
`;

const UserEmail = styled.div`
  font-size: clamp(14px, 2vw, 16px);
  color: #1a1a1a;
`;

const ToggleButton = styled.span`
  font-size: clamp(16px, 2vw, 20px);
  color: #555;
`;

const UserDetails = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  padding: clamp(10px, 2vw, 15px);
  border-top: 1px solid #eee;
`;

const DetailSection = styled.div`
  margin-bottom: clamp(10px, 2vw, 15px);
`;

const SectionLabel = styled.div`
  font-size: clamp(14px, 2vw, 16px);
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 5px;
`;

const DetailList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const DetailItem = styled.li`
  font-size: clamp(12px, 2vw, 14px);
  color: #555;
  margin-bottom: 5px;
`;

const EmptyMessage = styled.p`
  font-size: clamp(14px, 2vw, 16px);
  color: #666;
  font-style: italic;
`;

const Summary = styled.div`
  margin-top: clamp(15px, 3vw, 20px);
  padding: clamp(10px, 2vw, 15px);
  background: #f9f9f9;
  border-radius: 8px;
  text-align: center;
`;

const SummaryText = styled.p`
  font-size: clamp(14px, 2vw, 16px);
  color: #1a1a1a;
  margin: 5px 0;
`;

const Users = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filterCategories = ["all", "active", "inactive"]; // Options for the picker

  // Same locations array as LocationDetailClient
  const locations = [
    { id: 1, name: "Stabekk", lat: 59.90921845652782, lng: 10.611649286507243 },
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const fetchedUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email || "Unknown",
        rentals: (doc.data().rentals || []).map((rental: any) => ({
          ...rental,
          location: rental.location || "Stabekk", // Default to Stabekk if missing
        })),
        lastLogin: doc.data().lastLogin || "",
        createdAt: doc.data().createdAt || "",
      }) as UserData).sort((a, b) => new Date(b.lastLogin || 0).getTime() - new Date(a.lastLogin || 0).getTime());
      setUsers(fetchedUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleUserDetails = (userId: string) => {
    setOpenUserId(openUserId === userId ? null : userId);
  };

  const filteredUsers = useMemo(() => {
    let result = users.filter(
      (user) =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === "active") result = result.filter((user) => user.rentals.length > 0);
    if (filter === "inactive") result = result.filter((user) => user.rentals.length === 0);
    return result;
  }, [users, search, filter]);

  const totalRentals = filteredUsers.reduce((sum, user) => sum + user.rentals.length, 0);

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
      <FilterContainer>
        <CategoryFilterSection
          selectedCategory={filter}
          setSelectedCategory={setFilter}
          filterCategories={filterCategories}
        />
      </FilterContainer>
      {filteredUsers.length > 0 ? (
        <>
          <UserList>
            {filteredUsers.map((user) => (
              <UserItem key={user.id}>
                <UserHeader onClick={() => toggleUserDetails(user.id)}>
                  <UserEmail>
                    {user.email} (ID: {user.id})
                    <StatusBadge $hasRentals={user.rentals.length > 0}>
                      {user.rentals.length > 0 ? "Active" : "Inactive"}
                    </StatusBadge>
                  </UserEmail>
                  <ToggleButton>{openUserId === user.id ? "−" : "+"}</ToggleButton>
                </UserHeader>
                <UserDetails isOpen={openUserId === user.id}>
                  <DetailSection>
                    <SectionLabel>Rentals ({user.rentals.length})</SectionLabel>
                    <DetailList>
                      {user.rentals.length > 0 ? (
                        user.rentals
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((rental, idx) => (
                            <DetailItem key={idx}>
                              {rental.name} (Qty: {rental.quantity}) - {rental.location} - Rented on{" "}
                              {new Date(rental.date).toLocaleString()}
                            </DetailItem>
                          ))
                      ) : (
                        <EmptyMessage>No rentals</EmptyMessage>
                      )}
                    </DetailList>
                  </DetailSection>
                  <DetailSection>
                    <SectionLabel>Account Info</SectionLabel>
                    <DetailList>
                      <DetailItem>Created: {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}</DetailItem>
                      <DetailItem>Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "N/A"}</DetailItem>
                    </DetailList>
                  </DetailSection>
                </UserDetails>
              </UserItem>
            ))}
          </UserList>
          <Summary>
            <SummaryText>Total Users: {filteredUsers.length}</SummaryText>
            <SummaryText>Total Rentals: {totalRentals}</SummaryText>
          </Summary>
        </>
      ) : (
        <EmptyMessage>No users found.</EmptyMessage>
      )}
    </Container>
  );
};

export default Users;