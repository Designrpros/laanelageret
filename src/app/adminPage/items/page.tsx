import React from "react";
import styled from "styled-components";
import { useItemsViewModel } from "./viewModel";
import { ItemList } from "./ItemList";

const Container = styled.div`
  font-family: "Helvetica", Arial, sans-serif;
  background: #fff;
  padding: clamp(10px, 2vw, 20px);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #1a1a1a;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Title = styled.h1`
  font-size: clamp(16px, 4vw, 32px);
  font-weight: bold;
  margin-bottom: clamp(10px, 2vw, 20px);
  color: #1a1a1a;
  text-align: center;

  @media (max-width: 480px) {
    font-size: clamp(14px, 3vw, 24px);
    text-align: left;
  }
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
    isLoading,
    error,
    clearError,
  } = useItemsViewModel();

  const setDropdownPosition = (buttonRef: HTMLButtonElement | null) => {
    if (buttonRef && isCategoryPickerOpen) {
      const rect = buttonRef.getBoundingClientRect();
      const dropdown = buttonRef.nextElementSibling as HTMLElement | null;
      if (dropdown) {
        dropdown.style.top = `${rect.bottom + window.scrollY}px`;
        dropdown.style.left = `${rect.left + window.scrollX}px`;
        dropdown.style.width = `${rect.width}px`;
        if (window.innerWidth < 768) {
          dropdown.style.width = "90%";
          dropdown.style.left = "5%";
          dropdown.style.maxWidth = "none";
        }
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
        categories={categories} // Ensured
        isCategoryFormOpen={isCategoryFormOpen}
        setIsCategoryFormOpen={setIsCategoryFormOpen}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        handleAddItem={handleAddItem}
        handleAddCategory={handleAddCategory}
        setDropdownPosition={setDropdownPosition}
        isLoading={isLoading}
        error={error}
        clearError={clearError}
      />
    </Container>
  );
};

export default Items;