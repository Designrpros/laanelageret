import React, { useState } from "react";
import styled from "styled-components";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const locations = [{ id: 1, name: "Stabekk" }];

const FormPanel = styled.div<{ isopen: boolean }>`
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
  box-sizing: border-box;

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

const StockInput = styled(Input)`
  width: 100px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PickerContainer = styled.div`
  position: relative;
  width: 100%;
`;

const PickerButton = styled.button`
  padding: clamp(8px, 1.5vw, 12px) 15px;
  font-size: clamp(14px, 2vw, 16px);
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
  box-sizing: border-box;

  &:hover,
  &:focus {
    border-color: #333;
    background: #f5f5f5;
  }

  svg {
    font-size: clamp(16px, 2vw, 20px);
  }
`;

const PickerDropdown = styled.div<{ isopen: boolean }>`
  position: fixed;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #1a1a1a;
  max-height: ${({ isopen }) => (isopen ? "50vh" : "0")};
  overflow-y: auto;
  visibility: ${({ isopen }) => (isopen ? "visible" : "hidden")};
  transition: max-height 0.3s ease, visibility 0s linear ${({ isopen }) =>
    isopen ? "0s" : "0.3s"};
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  width: 100%;
  max-width: 300px;

  @media (max-width: 768px) {
    max-width: 90%;
    left: 5% !important;
    width: auto;
  }
`;

const PickerOption = styled.div`
  padding: clamp(8px, 1.5vw, 10px) 15px;
  font-size: clamp(12px, 2vw, 14px);
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
  font-size: clamp(14px, 2vw, 16px);
  color: #1a1a1a;
  font-weight: bold;
  padding: 5px 10px;
  background: #f5f5f5;
`;

const SubcategoryOption = styled.div`
  padding: clamp(8px, 1.5vw, 10px) 15px;
  font-size: clamp(12px, 2vw, 14px);
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

interface AddItemFormProps {
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
  isCategoryPickerOpen: boolean;
  setIsCategoryPickerOpen: (open: boolean) => void;
  categories: { id: string; name: string; subcategories: string[] }[];
  handleAddItem: () => void;
  setDropdownPosition: (buttonRef: HTMLButtonElement | null) => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const AddItemForm: React.FC<AddItemFormProps> = ({
  newItem,
  setNewItem,
  isFormOpen,
  isCategoryPickerOpen,
  setIsCategoryPickerOpen,
  categories,
  handleAddItem,
  setDropdownPosition,
  isLoading,
  error,
  clearError,
}) => {
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  const handleSubmit = () => {
    clearError();
    handleAddItem();
  };

  return (
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
        onChange={(e) => setNewItem({ ...newItem, rented: parseInt(e.target.value) || 0 })}
      />
      <StockInput
        type="number"
        placeholder="In Stock"
        value={newItem.inStock ?? ""}
        onChange={(e) => setNewItem({ ...newItem, inStock: parseInt(e.target.value) || 0 })}
      />
      {error && <ErrorText>{error}</ErrorText>}
      <SubmitButton onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Adding..." : "Add"}
      </SubmitButton>
    </FormPanel>
  );
};