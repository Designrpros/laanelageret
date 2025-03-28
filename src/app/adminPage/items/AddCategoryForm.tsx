import React, { useState } from "react";
import styled from "styled-components";

const CategoryForm = styled.div<{ isopen: boolean }>`
  max-height: ${({ isopen }) => (isopen ? "1000px" : "0")};
  opacity: ${({ isopen }) => (isopen ? "1" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  padding: clamp(8px, 1.5vw, 12px);
  font-size: clamp(14px, 2vw, 16px);
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

const SuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SuggestionItem = styled.li`
  padding: clamp(8px, 1.5vw, 12px);
  font-size: clamp(14px, 2vw, 16px);
  color: #1a1a1a;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #e0e0e0;
  }
`;

const SubmitButton = styled.button<{ disabled?: boolean }>`
  padding: clamp(8px, 1.5vw, 12px);
  font-size: clamp(14px, 2vw, 16px);
  background: ${({ disabled }) => (disabled ? "#666" : "#1a1a1a")};
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-weight: bold;
  transition: background 0.3s ease;
  width: auto;

  &:hover:not(:disabled) {
    background: #333;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ErrorText = styled.p`
  color: #ff4444;
  font-size: clamp(12px, 2vw, 14px);
  text-align: center;
  margin: 0;
`;

interface Category {
  id: string;
  name: string;
  subcategories: string[];
  createdAt?: string;
  createdBy?: string;
}

interface AddCategoryFormProps {
  newCategory: { name: string; subcategory: string };
  setNewCategory: (category: { name: string; subcategory: string }) => void;
  isCategoryFormOpen: boolean;
  handleAddCategory: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  categories: Category[]; // Add categories prop
}

export const AddCategoryForm: React.FC<AddCategoryFormProps> = ({
  newCategory,
  setNewCategory,
  isCategoryFormOpen,
  handleAddCategory,
  isLoading,
  error,
  clearError,
  categories,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = () => {
    clearError();
    handleAddCategory();
    setShowSuggestions(false); // Hide suggestions after submit
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewCategory({ ...newCategory, name: value });
    setShowSuggestions(value.length > 0); // Show suggestions when typing
  };

  const handleSuggestionClick = (categoryName: string) => {
    setNewCategory({ ...newCategory, name: categoryName });
    setShowSuggestions(false); // Hide suggestions after selection
  };

  const filteredSuggestions = categories
    .filter((cat) =>
      cat.name.toLowerCase().includes(newCategory.name.toLowerCase().trim())
    )
    .map((cat) => cat.name);

  return (
    <CategoryForm isopen={isCategoryFormOpen}>
      <InputContainer>
        <Input
          type="text"
          placeholder="Category Name"
          value={newCategory.name}
          onChange={handleCategoryChange}
          onFocus={() => setShowSuggestions(newCategory.name.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <SuggestionsList>
            {filteredSuggestions.map((suggestion) => (
              <SuggestionItem
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </SuggestionItem>
            ))}
          </SuggestionsList>
        )}
      </InputContainer>
      <Input
        type="text"
        placeholder="Subcategory/Tag"
        value={newCategory.subcategory}
        onChange={(e) => setNewCategory({ ...newCategory, subcategory: e.target.value })}
      />
      {error && <ErrorText>{error}</ErrorText>}
      <SubmitButton onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Category"}
      </SubmitButton>
    </CategoryForm>
  );
};