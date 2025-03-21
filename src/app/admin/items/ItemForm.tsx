// src/components/ItemForm.tsx
"use client";

import React from "react";
import styled from "styled-components";
import { FaPlus, FaChevronDown, FaTags } from "react-icons/fa";

interface ItemFormProps {
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
  width: 100px; /* Smaller for stock fields */
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

export const ItemForm: React.FC<ItemFormProps> = ({
  newItem,
  setNewItem,
  isFormOpen,
  isCategoryPickerOpen,
  setIsCategoryPickerOpen,
  categories,
  isCategoryFormOpen,
  newCategory,
  setNewCategory,
  handleAddItem,
  handleAddCategory,
  setDropdownPosition,
}) => {
  return (
    <>
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
    </>
  );
};