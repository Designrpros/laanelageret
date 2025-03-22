"use client";

import React, { useState } from "react";
import styled from "styled-components";
import AddIcon from "@mui/icons-material/Add";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

const locations = [{ id: 1, name: "Stabekk" }];

interface ItemListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filterCategories: string[];
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
  newItem: {
    name: string;
    category: string;
    subcategory: string;
    image: File | null;
    rented?: number;
    inStock?: number;
    location: string;
  };
  setNewItem: (item: {
    name: string;
    category: string;
    subcategory: string;
    image: File | null;
    rented?: number;
    inStock?: number;
    location: string;
  }) => void;
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
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBar = styled.input`
  flex: 1;
  min-width: 0; /* Prevents overflow */
  padding: 12px 15px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #1a1a1a;
  background: #fff;
  color: #1a1a1a;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #333;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const AddButton = styled.button`
  width: 40px;
  height: 40px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease;

  &:hover {
    background: #333;
  }

  svg {
    font-size: 20px;
  }
`;

const FormPanel = styled.div<{ isopen: boolean }>`
  max-height: ${({ isopen }) => (isopen ? "1000px" : "0")}; /* Increased for responsiveness */
  opacity: ${({ isopen }) => (isopen ? "1" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.2s ease;
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr); /* 2 columns on desktop */
  }
`;

const Input = styled.input`
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #1a1a1a;
  background: #fff;
  color: #1a1a1a;
  width: 100%;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #333;
  }
`;

const StockInput = styled(Input)`
  width: 100px;
  justify-self: start;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PickerContainer = styled.div`
  position: relative;
  width: 100%;
`;

const PickerButton = styled.button`
  padding: 12px 15px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #1a1a1a;
  background: #fff;
  color: #1a1a1a;
  width: 100%;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.3s ease;

  &:hover,
  &:focus {
    border-color: #333;
    background: #f5f5f5;
  }

  svg {
    font-size: 20px;
  }
`;

const PickerDropdown = styled.div<{ isopen: boolean }>`
  position: fixed;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #1a1a1a;
  max-height: ${({ isopen }) => (isopen ? "70vh" : "0")};
  overflow-y: auto;
  visibility: ${({ isopen }) => (isopen ? "visible" : "hidden")};
  transition: max-height 0.3s ease, visibility 0s linear ${({ isopen }) =>
    isopen ? "0s" : "0.3s"};
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
`;

const PickerOption = styled.div`
  padding: 10px 15px;
  font-size: 14px;
  color: #1a1a1a;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #e0e0e0;
  }
`;

const CategorySection = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const CategoryTitle = styled.div`
  font-size: 16px;
  color: #1a1a1a;
  font-weight: bold;
  padding: 5px 10px;
  background: #f5f5f5;
`;

const SubcategoryOption = styled.div`
  padding: 10px 15px;
  font-size: 14px;
  color: #1a1a1a;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #e0e0e0;
  }
`;

const SubmitButton = styled.button`
  padding: 12px;
  font-size: 16px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s ease;
  justify-self: start;

  &:hover {
    background: #333;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CategoryForm = styled.div<{ isopen: boolean }>`
  max-height: ${({ isopen }) => (isopen ? "1000px" : "0")};
  opacity: ${({ isopen }) => (isopen ? "1" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.2s ease;
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CategoryFilters = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const FilterButton = styled.button<{ isactive: boolean }>`
  padding: 8px 15px;
  font-size: 14px;
  background: ${({ isactive }) => (isactive ? "#1a1a1a" : "transparent")};
  color: ${({ isactive }) => (isactive ? "#fff" : "#1a1a1a")};
  border: 1px solid #1a1a1a;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #e0e0e0;
  }
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const ItemCard = styled.div`
  background: transparent;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  height: 500px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 50%;
  object-fit: cover;
`;

const ItemContent = styled.div`
  padding: 15px;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemName = styled.h3`
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const ItemCategory = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
`;

const StockContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const StockField = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f5f5f5;
  padding: 6px 10px;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
`;

const StockLabel = styled.span`
  font-size: 0.9rem;
  color: #1a1a1a;
`;

const StockInputItem = styled.input`
  width: 60px;
  padding: 6px;
  font-size: 0.9rem;
  border: 1px solid #1a1a1a;
  background: #fff;
  color: #1a1a1a;
  text-align: center;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #333;
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
  const [stockUpdates, setStockUpdates] = useState<{
    [key: string]: { rented: number; inStock: number };
  }>({});
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

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
    <>
      <SearchContainer>
        <SearchBar
          type="text"
          placeholder="Search for an item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <AddButton onClick={() => setIsFormOpen(!isFormOpen)}>
          <AddIcon />
        </AddButton>
        <AddButton onClick={() => setIsCategoryFormOpen(!isCategoryFormOpen)}>
          <LabelOutlinedIcon />
        </AddButton>
      </SearchContainer>

      <FormPanel isopen={isFormOpen}>
        <Input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <PickerContainer>
          <PickerButton
            ref={(ref) => setDropdownPosition(ref)}
            onClick={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
          >
            {newItem.category && newItem.subcategory
              ? `${newItem.category} - ${newItem.subcategory}`
              : "Select Category & Subcategory"}
            <ArrowDropDownIcon />
          </PickerButton>
          <PickerDropdown isopen={isCategoryPickerOpen}>
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
          </PickerDropdown>
        </PickerContainer>
        <PickerContainer>
          <PickerButton
            ref={(ref) => setDropdownPosition(ref)}
            onClick={() => setIsLocationPickerOpen(!isLocationPickerOpen)}
          >
            {newItem.location ? newItem.location : "Select Location"}
            <ArrowDropDownIcon />
          </PickerButton>
          <PickerDropdown isopen={isLocationPickerOpen}>
            {locations.map((loc) => (
              <PickerOption
                key={loc.id}
                onClick={() => {
                  setNewItem({ ...newItem, location: loc.name });
                  setIsLocationPickerOpen(false);
                }}
              >
                {loc.name}
              </PickerOption>
            ))}
          </PickerDropdown>
        </PickerContainer>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setNewItem({ ...newItem, image: e.target.files?.[0] || null })}
        />
        <StockInput
          type="number"
          placeholder="Rented"
          value={newItem.rented ?? ""}
          onChange={(e) =>
            setNewItem({ ...newItem, rented: parseInt(e.target.value) || 0 })
          }
        />
        <StockInput
          type="number"
          placeholder="In Stock"
          value={newItem.inStock ?? ""}
          onChange={(e) =>
            setNewItem({ ...newItem, inStock: parseInt(e.target.value) || 0 })
          }
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
          onChange={(e) =>
            setNewCategory({ ...newCategory, subcategory: e.target.value })
          }
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
    </>
  );
};