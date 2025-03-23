// src/app/adminPage/ItemGridSection.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

const ItemList = styled.ul`
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 1200px;
`;

const Item = styled.li`
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

const ItemHeader = styled.div`
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

const ItemName = styled.h3`
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

const ItemDetails = styled.div<{ isOpen: boolean }>`
  max-height: ${({ isOpen }) => (isOpen ? "500px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: ${({ isOpen }) => (isOpen ? "clamp(10px, 2vw, 15px)" : "0 clamp(10px, 2vw, 15px)")};
`;

const Image = styled.img`
  width: 100%;
  max-width: 200px;
  height: auto;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: clamp(10px, 2vw, 15px);
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

const StockContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: clamp(10px, 2vw, 15px) 0;
  flex-wrap: wrap;
`;

const StockField = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f5f5f5;
  padding: clamp(4px, 1vw, 6px) 10px;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
`;

const StockLabel = styled.span`
  font-size: clamp(10px, 2vw, 14px);
  color: #1a1a1a;
`;

const StockInputItem = styled.input`
  width: clamp(50px, 10vw, 60px);
  padding: clamp(4px, 1vw, 6px);
  font-size: clamp(12px, 2vw, 14px);
  border: 1px solid #1a1a1a;
  background: #fff;
  color: #1a1a1a;
  text-align: center;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s ease;
  box-sizing: border-box;

  &:focus {
    border-color: #333;
  }
`;

const DeleteButton = styled.button`
  background: #ff4444;
  color: #fff;
  border: none;
  padding: clamp(6px, 1vw, 8px) clamp(10px, 2vw, 12px);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: clamp(12px, 2vw, 16px);

  &:hover {
    background: #cc3333;
  }
`;

interface ItemGridSectionProps {
  filteredItems: {
    id: string;
    name: string;
    category: string;
    subcategory?: string;
    imageUrl: string;
    rented: number;
    inStock: number;
    location?: string;
  }[];
  handleDeleteItem: (id: string) => void;
  stockUpdates: { [key: string]: { rented: number; inStock: number } };
  setStockUpdates: React.Dispatch<
    React.SetStateAction<{ [key: string]: { rented: number; inStock: number } }>
  >;
}

export const ItemGridSection: React.FC<ItemGridSectionProps> = ({
  filteredItems,
  handleDeleteItem,
  stockUpdates,
  setStockUpdates,
}) => {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const toggleItemDetails = (itemId: string) => {
    setOpenItemId(openItemId === itemId ? null : itemId);
  };

  const handleStockChange = (
    itemId: string,
    field: "rented" | "inStock",
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    setStockUpdates((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: numValue },
    }));
  };

  const saveStock = async (itemId: string) => {
    const updates = stockUpdates[itemId];
    if (updates) {
      try {
        await updateDoc(doc(db, "items", itemId), {
          rented: updates.rented ?? filteredItems.find((i) => i.id === itemId)?.rented,
          inStock: updates.inStock ?? filteredItems.find((i) => i.id === itemId)?.inStock,
        });
        setStockUpdates((prev) => {
          const newUpdates = { ...prev };
          delete newUpdates[itemId];
          return newUpdates;
        });
      } catch (error) {
        console.error("Error updating stock:", error);
      }
    }
  };

  return (
    <ItemList>
      {filteredItems.length > 0 ? (
        filteredItems.map((item) => (
          <Item key={item.id}>
            <ItemHeader onClick={() => toggleItemDetails(item.id)}>
              <ItemName>{item.name} ({item.category}{item.subcategory ? ` - ${item.subcategory}` : ""})</ItemName>
              <ToggleButton>{openItemId === item.id ? "−" : "+"}</ToggleButton>
            </ItemHeader>
            <ItemDetails isOpen={openItemId === item.id}>
              <Image src={item.imageUrl} alt={item.name} />
              <DetailList>
                <DetailItem>ID: {item.id}</DetailItem>
                <DetailItem>Location: {item.location || "N/A"}</DetailItem>
              </DetailList>
              <StockContainer>
                <StockField>
                  <StockLabel>Utleid:</StockLabel>
                  <StockInputItem
                    type="number"
                    value={stockUpdates[item.id]?.rented ?? item.rented}
                    onChange={(e) => handleStockChange(item.id, "rented", e.target.value)}
                    onBlur={() => saveStock(item.id)}
                  />
                </StockField>
                <StockField>
                  <StockLabel>På lager:</StockLabel>
                  <StockInputItem
                    type="number"
                    value={stockUpdates[item.id]?.inStock ?? item.inStock}
                    onChange={(e) => handleStockChange(item.id, "inStock", e.target.value)}
                    onBlur={() => saveStock(item.id)}
                  />
                </StockField>
              </StockContainer>
              <DeleteButton onClick={() => handleDeleteItem(item.id)}>Delete</DeleteButton>
            </ItemDetails>
          </Item>
        ))
      ) : (
        <p>No items found.</p>
      )}
    </ItemList>
  );
};