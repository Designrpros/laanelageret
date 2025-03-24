import React from "react";
import styled from "styled-components";
import AddIcon from "@mui/icons-material/Add";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px; /* Center and cap width */
  justify-content: center;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-wrap: nowrap; /* Prevent wrapping to new line */
    padding: 0 10px; /* Add side padding to prevent edge clipping */
  }
`;

const SearchBar = styled.input`
  flex: 1; /* Take available space */
  min-width: 0; /* Allow shrinking */
  padding: clamp(8px, 1.5vw, 12px);
  font-size: clamp(14px, 2vw, 16px);
  border-radius: 8px;
  border: 1px solid #1a1a1a;
  background: #fff;
  color: #1a1a1a;
  outline: none;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  max-width: 100%; /* Prevent overflow */

  &:focus {
    border-color: #333;
  }

  @media (max-width: 768px) {
    flex: 1; /* Still take available space */
    min-width: 100px; /* Minimum width to stay usable */
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
  flex-shrink: 0; /* Prevent buttons from shrinking */

  &:hover {
    background: #333;
  }

  svg {
    font-size: clamp(16px, 2vw, 20px);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

interface SearchBarSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  isCategoryFormOpen: boolean;
  setIsCategoryFormOpen: (open: boolean) => void;
}

export const SearchBarSection: React.FC<SearchBarSectionProps> = ({
  searchTerm,
  setSearchTerm,
  isFormOpen,
  setIsFormOpen,
  isCategoryFormOpen,
  setIsCategoryFormOpen,
}) => (
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
);