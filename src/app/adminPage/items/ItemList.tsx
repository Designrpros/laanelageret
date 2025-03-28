"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { SearchBarSection } from "./SearchBarSection";
import { AddItemForm } from "./AddItemForm";
import { AddCategoryForm } from "./AddCategoryForm";
import { CategoryFilterSection } from "./CategoryFilterSection";
import { ItemGridSection } from "./ItemGridSection";

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
  isLoading: boolean; // Added for loading state
  error: string | null; // Added for error feedback
  clearError: () => void; // Added to clear errors
}

export const ItemList: React.FC<ItemListProps> = (props) => {
  const [stockUpdates, setStockUpdates] = useState<{
    [key: string]: { rented: number; inStock: number };
  }>({});

  return (
    <Container>
      <SearchBarSection
        searchTerm={props.searchTerm}
        setSearchTerm={props.setSearchTerm}
        isFormOpen={props.isFormOpen}
        setIsFormOpen={props.setIsFormOpen}
        isCategoryFormOpen={props.isCategoryFormOpen}
        setIsCategoryFormOpen={props.setIsCategoryFormOpen}
      />
      <AddItemForm
        newItem={props.newItem}
        setNewItem={props.setNewItem}
        isFormOpen={props.isFormOpen}
        isCategoryPickerOpen={props.isCategoryPickerOpen}
        setIsCategoryPickerOpen={props.setIsCategoryPickerOpen}
        categories={props.categories}
        handleAddItem={props.handleAddItem}
        setDropdownPosition={props.setDropdownPosition}
        isLoading={props.isLoading}
        error={props.error}
        clearError={props.clearError}
      />
      <AddCategoryForm
        newCategory={props.newCategory}
        setNewCategory={props.setNewCategory}
        isCategoryFormOpen={props.isCategoryFormOpen}
        handleAddCategory={props.handleAddCategory}
        isLoading={props.isLoading}
        error={props.error}
        clearError={props.clearError}
        categories={props.categories} // Added here
      />
      <CategoryFilterSection
        selectedCategory={props.selectedCategory}
        setSelectedCategory={props.setSelectedCategory}
        filterCategories={props.filterCategories}
      />
      <ItemGridSection
        filteredItems={props.filteredItems}
        handleDeleteItem={props.handleDeleteItem}
        stockUpdates={stockUpdates}
        setStockUpdates={setStockUpdates}
      />
    </Container>
  );
};


const Container = styled.div`
  width: 100%;
  max-width: 100%;
  padding: clamp(10px, 2vw, 20px); /* Apply padding on all sides */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  overflow-x: hidden; /* Prevent horizontal overflow */
`;