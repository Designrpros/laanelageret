import React from "react";
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

interface AddCategoryFormProps {
  newCategory: { name: string; subcategory: string };
  setNewCategory: (category: { name: string; subcategory: string }) => void;
  isCategoryFormOpen: boolean;
  handleAddCategory: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const AddCategoryForm: React.FC<AddCategoryFormProps> = ({
  newCategory,
  setNewCategory,
  isCategoryFormOpen,
  handleAddCategory,
  isLoading,
  error,
  clearError,
}) => {
  const handleSubmit = () => {
    clearError();
    handleAddCategory();
  };

  return (
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
      {error && <ErrorText>{error}</ErrorText>}
      <SubmitButton onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Category"}
      </SubmitButton>
    </CategoryForm>
  );
};