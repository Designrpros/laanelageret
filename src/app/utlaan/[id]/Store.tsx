// src/app/store/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { db } from "../../../firebase"; // Adjust path to your Firebase config
import { collection, onSnapshot } from "firebase/firestore";

interface Item {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  imageUrl: string;
}

// Styled Components
const StoreContainer = styled.div`
  min-height: 100vh;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: "Helvetica", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StoreTitle = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 3rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  max-width: 1200px;
`;

const FilterButton = styled.button<{ isActive: boolean }>`
  padding: 10px 20px;
  font-size: clamp(14px, 2vw, 16px);
  background: ${({ isActive }) => (isActive ? "#007bff" : "#fff")};
  color: ${({ isActive }) => (isActive ? "#fff" : "#333")};
  border: 2px solid #007bff;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #007bff;
    color: #fff;
    transform: translateY(-2px);
  }
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
`;

const StoreItemCard = styled(motion.div)`
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ItemImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 2px solid #007bff;
`;

const ItemContent = styled.div`
  padding: 1.5rem;
  text-align: center;
`;

const ItemName = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const ItemCategory = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
`;

const BorrowButton = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #0056b3;
  }
`;

const Store: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch items from Firestore with real-time updates
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];
      setItems(fetchedItems);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching items:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get unique categories for filtering
  const categories = ["All", ...new Set(items.map((item) => item.category))];

  // Filter items based on selected category
  const filteredItems = selectedCategory === "All"
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const handleBorrow = (itemId: string) => {
    alert(`Borrowing ${items.find((item) => item.id === itemId)?.name}!`);
    // Add your borrowing logic here (e.g., API call to update availability)
  };

  return (
    <StoreContainer>
      <StoreTitle
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Our Store
      </StoreTitle>

      <FilterBar>
        {categories.map((category) => (
          <FilterButton
            key={category}
            isActive={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </FilterButton>
        ))}
      </FilterBar>

      {isLoading ? (
        <p>Loading items...</p>
      ) : (
        <ItemGrid>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <StoreItemCard
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ItemImage src={item.imageUrl} alt={item.name} />
                <ItemContent>
                  <ItemName>{item.name}</ItemName>
                  <ItemCategory>
                    {item.category}{item.subcategory ? ` - ${item.subcategory}` : ""}
                  </ItemCategory>
                  <BorrowButton onClick={() => handleBorrow(item.id)}>
                    Borrow Now
                  </BorrowButton>
                </ItemContent>
              </StoreItemCard>
            ))
          ) : (
            <p>No items available in this category.</p>
          )}
        </ItemGrid>
      )}
    </StoreContainer>
  );
};

export default Store;