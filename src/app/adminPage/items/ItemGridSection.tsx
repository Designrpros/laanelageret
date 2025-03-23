import React from "react";
import styled from "styled-components";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Consistent sizing */
  gap: clamp(10px, 2vw, 20px);
  width: 100%;
  max-width: 1200px; /* Cap width for alignment */
  justify-items: center; /* Center cards within grid cells */
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Stack on mobile */
  }
`;

const ItemCard = styled.div`
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  width: 100%;
  max-width: 300px;
  height: auto;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 8px;
  overflow: hidden;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    max-width: 100%;
    min-height: 300px;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 50%;
  object-fit: cover;

  @media (max-width: 768px) {
    height: 40%;
  }
`;

const ItemContent = styled.div`
  padding: clamp(10px, 2vw, 15px);
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemName = styled.h3`
  font-size: clamp(16px, 3vw, 20px);
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const ItemCategory = styled.p`
  font-size: clamp(12px, 2vw, 16px);
  color: #666;
  margin-bottom: 1rem;
`;

const StockContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
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
    <ItemGrid>
      {filteredItems.length > 0 ? (
        filteredItems.map((item) => (
          <ItemCard key={item.id}>
            <Image src={item.imageUrl} alt={item.name} />
            <ItemContent>
              <ItemName>{item.name}</ItemName>
              <ItemCategory>
                {item.category}
                {item.subcategory ? ` - ${item.subcategory}` : ""}
                {item.location ? ` (${item.location})` : ""}
              </ItemCategory>
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
            </ItemContent>
          </ItemCard>
        ))
      ) : (
        <p>No items found.</p>
      )}
    </ItemGrid>
  );
};