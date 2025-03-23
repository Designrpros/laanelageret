"use client";

import React from "react";
import styled from "styled-components";
import { useItemsViewModel } from "./viewModel";
import { ItemList } from "./ItemList";

// Styled Components
const Container = styled.div`
  font-family: "Helvetica", Arial, sans-serif;
  background: transparent; /* No background to blend with MainContent */
  padding: 0; /* Remove padding, let MainContent handle it */
  color: #1a1a1a;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto; /* Center content */
`;

const Title = styled.h1`
  font-size: clamp(24px, 4vw, 32px);
  font-weight: bold;
  margin-bottom: 20px;
  color: #1a1a1a;
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