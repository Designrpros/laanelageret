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
  flex-wrap: wrap;
  justify-content: center;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBar = styled.input`
  flex: 1;
  min-width: 0;
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