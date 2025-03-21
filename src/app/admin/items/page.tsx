// src/app/admin/items/page.tsx
"use client";

import React from "react";
import styled from "styled-components";
import { useItemsViewModel } from "./viewModel";
import { ItemList } from "./ItemList";

const Container = styled.div`
  font-family: "Helvetica", Arial, sans-serif;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  padding: 2vw;
  border-radius: 12px;
  color: #fff;
  margin: 2vh 0;
  width: 100%;
  overflow-x: hidden;
  max-width: 1200px;
`;

const Title = styled.h1`
  font-size: clamp(24px, 4vw, 32px);
  font-weight: bold;
  margin-bottom: 2vh;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Items = () => {
  const {
    items,
    newItem,
    setNewItem,
    searchTerm,
    setSearchTerm,
    isFormOpen,
    setIsFormOpen,
    selectedCategory,
    setSelectedCategory,
    isCategoryPickerOpen,
    setIsCategoryPickerOpen,
    categories,
    isCategoryFormOpen,
    setIsCategoryFormOpen,
    newCategory,
    setNewCategory,
    handleAddItem,
    handleDeleteItem,
    handleAddCategory,
    filterCategories,
    filteredItems,
  } = useItemsViewModel();

  const setDropdownPosition = (buttonRef: HTMLButtonElement | null) => {
    if (buttonRef && isCategoryPickerOpen) {
      const rect = buttonRef.getBoundingClientRect();
      const dropdown = buttonRef.nextElementSibling as HTMLElement;
      if (dropdown) {
        dropdown.style.top = `${rect.bottom + window.scrollY}px`;
        dropdown.style.left = `${rect.left + window.scrollX}px`;
        dropdown.style.width = `${rect.width}px`;
      }
    }
  };

  return (
    <Container>
      <Title>Items Management</Title>

      <ItemList
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        filterCategories={filterCategories}
        filteredItems={filteredItems}
        handleDeleteItem={handleDeleteItem}
        newItem={newItem}
        setNewItem={setNewItem}
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        isCategoryPickerOpen={isCategoryPickerOpen}
        setIsCategoryPickerOpen={setIsCategoryPickerOpen}
        categories={categories}
        isCategoryFormOpen={isCategoryFormOpen}
        setIsCategoryFormOpen={setIsCategoryFormOpen}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        handleAddItem={handleAddItem}
        handleAddCategory={handleAddCategory}
        setDropdownPosition={setDropdownPosition}
      />
    </Container>
  );
};

export default Items;