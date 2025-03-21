// src/components/ItemList.tsx
"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { FaPlus, FaTags, FaChevronDown } from "react-icons/fa";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

interface ItemListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filterCategories: string[];
  filteredItems: { id: string; name: string; category: string; subcategory?: string; imageUrl: string; rented: number; inStock: number }[];
  handleDeleteItem: (id: string) => void;
  newItem: { name: string; category: string; subcategory: string; image: File | null; rented?: number; inStock?: number };
  setNewItem: (item: { name: string; category: string; subcategory: string; image: File | null; rented?: number; inStock?: number }) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  isCategoryPickerOpen: boolean;
  setIsCategoryPickerOpen: (open: boolean) => void;
  categories: { id: string; name: string; subcategories: string[] }[];
  isCategoryFormOpen: boolean;
  setIsCategoryFormOpen: (open: boolean) => void;
  newCategory: { name: string; subcategory: string };
  setNewCategory: (category: { name: string; subcategory: string }) => void;
  handleAddItem: () => void;
  handleAddCategory: () => void;
  setDropdownPosition: (buttonRef: HTMLButtonElement | null) => void;
}

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1vw;
  margin-bottom: 2vh;
  flex-wrap: wrap;
`;

const SearchBar = styled.input`
  width: 70%;
  max-width: 600px;
  padding: 12px 15px;
  font-size: clamp(14px, 2vw, 16px);
  border-radius: 8px;
  border: 1px solid #444;
  background: #333;
  color: #fff;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #ffdd00;
  }
`;

const AddButton = styled.button`
  width: 40px;
  height: 40px;
  background: #ffdd00;
  color: #000;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, background 0.3s ease;

  &:hover {
    background: #e6c800;
    transform: scale(1.1);
  }

  svg {
    font-size: 20px;
  }
`;

const FormPanel = styled.div<{ isopen: boolean }>`
  max-height: ${({ isopen }) => (isopen ? "50vh" : "0")};
  opacity: ${({ isopen }) => (isopen ? "1" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1.5vh;
  margin-bottom: 2vh;
`;

const Input = styled.input`
  padding: 12px;
  font-size: clamp(14px, 2vw, 16px);
  border-radius: 8px;
  border: 1px solid #444;
  background: #333;
  color: #fff;
  width: 100%;
  outline: none;

  &:focus {
    border-color: #ffdd00;
  }
`;

const StockInput = styled(Input)`
  width: 100px;
`;

const CategoryPickerContainer = styled.div`
  position: relative;
  width: 100%;
`;

const CategoryButton = styled.button`
  padding: 12px 15px;
  font-size: clamp(14px, 2vw, 16px);
  border-radius: 8px;
  border: 1px solid #444;
  background: #333;
  color: #fff;
  width: 100%;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.3s ease, background 0.3s ease;

  &:hover,
  &:focus {
    border-color: #ffdd00;
    background: #3a3a3a;
  }
`;

const CategoryDropdown = styled.div<{ isopen: boolean }>`
  position: fixed;
  top: auto;
  left: auto;
  width: inherit;
  background: #333;
  border-radius: 8px;
  border: 1px solid #444;
  max-height: ${({ isopen }) => (isopen ? "70vh" : "0")};
  overflow-y: auto;
  visibility: ${({ isopen }) => (isopen ? "visible" : "hidden")};
  transition: max-height 0.3s ease, visibility 0s linear ${({ isopen }) => (isopen ? "0s" : "0.3s")};
  z-index: 20;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  padding: 1vh 0;
`;

const CategorySection = styled.div`
  padding: 1vh 0;
  border-bottom: 1px solid #555;

  &:last-child {
    border-bottom: none;
  }
`;

const CategoryTitle = styled.div`
  font-size: clamp(14px, 2vw, 16px);
  color: #fff;
  font-weight: bold;
  padding: 5px 10px;
  background: #2a2a2a;
  border-radius: 4px;
  margin-bottom: 1vh;
`;

const SubcategoryOption = styled.div`
  padding: 10px 15px;
  font-size: clamp(12px, 1.8vw, 14px);
  color: #ddd;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: #ffdd00;
    color: #000;
  }
`;

const SubmitButton = styled.button`
  padding: 12px;
  font-size: clamp(14px, 2vw, 16px);
  background: #ffdd00;
  color: #000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s ease;

  &:hover {
    background: #e6c800;
  }
`;

const CategoryForm = styled.div<{ isopen: boolean }>`
  max-height: ${({ isopen }) => (isopen ? "40vh" : "0")};
  opacity: ${({ isopen }) => (isopen ? "1" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1.5vh;
  margin-bottom: 2vh;
`;

const CategoryFilters = styled.div`
  display: flex;
  gap: 1vw;
  flex-wrap: wrap;
  margin-bottom: 2vh;
`;

const FilterButton = styled.button<{ isactive: boolean }>`
  padding: 8px 15px;
  font-size: clamp(12px, 1.8vw, 14px);
  background: ${({ isactive }) => (isactive ? "#ffdd00" : "#444")};
  color: ${({ isactive }) => (isactive ? "#000" : "#fff")};
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;

  &:hover {
    background: #ffdd00;
    color: #000;
    transform: translateY(-2px);
  }
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2vw;
  margin-top: 2vh;
  padding-right: 1vw;
`;

const ItemCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  height: 500px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 50%;
  object-fit: cover;
`;

const ItemContent = styled.div`
  padding: 1.5rem;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemName = styled.h3`
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const ItemCategory = styled.p`
  font-size: 1rem;
  color: #ddd;
  margin-bottom: 1rem;
`;

const StockContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const StockField = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #444;
  padding: 6px 10px;
  border: 1px solid #666;
`;

const StockLabel = styled.span`
  font-size: 0.9rem;
  color: #fff;
`;

const StockInputItem = styled.input`
  width: 60px;
  padding: 6px;
  font-size: 0.9rem;
  border: 1px solid #ffdd00;
  background: #333;
  color: #fff;
  text-align: center;
  border-radius: 0;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #e6c800;
  }
`;

const DeleteButton = styled.button`
  background: #ff4444;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #cc3333;
  }
`;

export const ItemList: React.FC<ItemListProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  filterCategories,
  filteredItems,
  handleDeleteItem,
  newItem,
  setNewItem,
  isFormOpen,
  setIsFormOpen,
  isCategoryPickerOpen,
  setIsCategoryPickerOpen,
  categories,
  isCategoryFormOpen,
  setIsCategoryFormOpen,
  newCategory,
  setNewCategory,
  handleAddItem,
  handleAddCategory,
  setDropdownPosition,
}) => {
  const [stockUpdates, setStockUpdates] = useState<{ [key: string]: { rented: number; inStock: number } }>({});

  const handleStockChange = (itemId: string, field: "rented" | "inStock", value: string) => {
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
        console.log(`Saving stock for item ${itemId}:`, updates);
        await updateDoc(doc(db, "items", itemId), {
          rented: updates.rented ?? filteredItems.find((i) => i.id === itemId)?.rented,
          inStock: updates.inStock ?? filteredItems.find((i) => i.id === itemId)?.inStock,
        });
        console.log(`Stock updated successfully for item ${itemId}`);
        setStockUpdates((prev) => {
          const newUpdates = { ...prev };
          delete newUpdates[itemId];
          return newUpdates;
        });
      } catch (error) {
        console.error("Error updating stock:", error);
      }
    } else {
      console.log(`No updates to save for item ${itemId}`);
    }
  };

  return (
    <>
      <SearchContainer>
        <SearchBar
          type="text"
          placeholder="Search for an item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <AddButton onClick={() => setIsFormOpen(!isFormOpen)}>
          <FaPlus />
        </AddButton>
        <AddButton onClick={() => setIsCategoryFormOpen(!isCategoryFormOpen)}>
          <FaTags />
        </AddButton>
      </SearchContainer>

      <FormPanel isopen={isFormOpen}>
        <Input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <CategoryPickerContainer>
          <CategoryButton
            ref={(ref) => setDropdownPosition(ref)}
            onClick={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
          >
            {newItem.category && newItem.subcategory
              ? `${newItem.category} - ${newItem.subcategory}`
              : "Select Category & Subcategory"}
            <FaChevronDown />
          </CategoryButton>
          <CategoryDropdown isopen={isCategoryPickerOpen}>
            {categories.map((cat) => (
              <CategorySection key={cat.id}>
                <CategoryTitle>{cat.name}</CategoryTitle>
                {cat.subcategories.map((sub) => (
                  <SubcategoryOption
                    key={`${cat.id}-${sub}`}
                    onClick={() => {
                      setNewItem({ ...newItem, category: cat.name, subcategory: sub });
                      setIsCategoryPickerOpen(false);
                    }}
                  >
                    {sub}
                  </SubcategoryOption>
                ))}
              </CategorySection>
            ))}
          </CategoryDropdown>
        </CategoryPickerContainer>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setNewItem({ ...newItem, image: e.target.files?.[0] || null })}
        />
        <StockInput
          type="number"
          placeholder="Rented"
          value={newItem.rented ?? ""}
          onChange={(e) => setNewItem({ ...newItem, rented: parseInt(e.target.value) || 0 })}
        />
        <StockInput
          type="number"
          placeholder="In Stock"
          value={newItem.inStock ?? ""}
          onChange={(e) => setNewItem({ ...newItem, inStock: parseInt(e.target.value) || 0 })}
        />
        <SubmitButton onClick={handleAddItem}>Add</SubmitButton>
      </FormPanel>

      <CategoryForm isopen={isCategoryFormOpen}>
        <Input
          type="text"
          placeholder="Category Name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
        />
        <Input
          type="text"
          placeholder="Subcategory/Tag"
          value={newCategory.subcategory}
          onChange={(e) => setNewCategory({ ...newCategory, subcategory: e.target.value })}
        />
        <SubmitButton onClick={handleAddCategory}>Add Category</SubmitButton>
      </CategoryForm>

      <CategoryFilters>
        {filterCategories.map((cat) => (
          <FilterButton
            key={cat}
            isactive={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </FilterButton>
        ))}
      </CategoryFilters>

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
                <DeleteButton onClick={() => handleDeleteItem(item.id)}>
                  Delete
                </DeleteButton>
              </ItemContent>
            </ItemCard>
          ))
        ) : (
          <p>No items found.</p>
        )}
      </ItemGrid>
    </>
  );
};