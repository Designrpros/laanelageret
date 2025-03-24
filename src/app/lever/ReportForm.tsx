import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

interface Rental {
  itemId: string;
  name: string;
  quantity: number;
  date: string;
  location?: string; // Optional, added for consistency
}

interface ReportFormProps {
  userRentals: Rental[];
  selectedRental: string;
  setSelectedRental: (value: string) => void;
  reportDetails: string;
  setReportDetails: (value: string) => void;
  handleReportSubmit: (e: React.FormEvent) => void;
  selectedLocation: string; // New prop for location
  setSelectedLocation: (value: string) => void; // New prop to update location
}

export const ReportForm: React.FC<ReportFormProps> = ({
  userRentals,
  selectedRental,
  setSelectedRental,
  reportDetails,
  setReportDetails,
  handleReportSubmit,
  selectedLocation,
  setSelectedLocation,
}) => {
  // Same locations array as LocationDetailClient
  const locations = [
    { id: 1, name: "Stabekk", lat: 59.90921845652782, lng: 10.611649286507243 },
  ];

  return (
    <ReportFormContainer
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FormTitle>Rapporter mistet eller ødelagt gjenstand</FormTitle>
      <Form onSubmit={handleReportSubmit}>
        <FormField>
          <FormLabel>Velg utlån:</FormLabel>
          <FormSelect
            value={selectedRental}
            onChange={(e) => setSelectedRental(e.target.value)}
            required
          >
            <option value="">-- Velg en gjenstand --</option>
            {userRentals.map((rental) => (
              <option key={`${rental.itemId}-${rental.date}`} value={`${rental.itemId}-${rental.date}`}>
                {rental.name} (Antall: {rental.quantity}, Utlånt: {new Date(rental.date).toLocaleDateString()})
              </option>
            ))}
          </FormSelect>
        </FormField>
        <FormField>
          <FormLabel>Lokasjon:</FormLabel>
          <FormSelect
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            required
          >
            <option value="">-- Velg en lokasjon --</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </FormSelect>
        </FormField>
        <FormField>
          <FormLabel>Detaljer:</FormLabel>
          <FormTextarea
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            placeholder="Beskriv problemet (f.eks. gjenstand mistet, skadet del)"
            required
          />
        </FormField>
        <SubmitButton type="submit">Send inn rapport</SubmitButton>
      </Form>
    </ReportFormContainer>
  );
};

// Styled Components (unchanged)
const ReportFormContainer = styled(motion.div)`
  width: 100%;
  max-width: clamp(300px, 90vw, 800px); /* Responsive max-width */
  background: #fff;
  padding: clamp(1rem, 3vw, 1.5rem);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
`;

const FormTitle = styled.h2`
  font-size: clamp(1.25rem, 4vw, 2rem);
  color: #1a1a1a;
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.5rem);
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 1vw, 0.5rem);

  @media (min-width: 768px) {
    flex-direction: row; /* Side-by-side on larger screens */
    align-items: center;
    gap: 1rem;
  }
`;

const FormLabel = styled.label`
  font-size: clamp(0.9rem, 2vw, 1.25rem);
  color: #1a1a1a;
  font-weight: 500;

  @media (min-width: 768px) {
    flex: 0 0 120px; /* Fixed width for labels on larger screens */
  }
`;

const FormSelect = styled.select`
  padding: clamp(8px, 1.5vw, 12px);
  border: 2px solid #ccc;
  border-radius: 6px;
  font-size: clamp(0.9rem, 2vw, 1.25rem);
  background: #f9f9f9;
  transition: border-color 0.3s ease;
  width: 100%;

  &:focus {
    border-color: #1a1a1a;
    outline: none;
  }
`;

const FormTextarea = styled.textarea`
  padding: clamp(8px, 1.5vw, 12px);
  border: 2px solid #ccc;
  border-radius: 6px;
  font-size: clamp(0.9rem, 2vw, 1.25rem);
  min-height: clamp(80px, 15vh, 120px);
  background: #f9f9f9;
  resize: vertical;
  transition: border-color 0.3s ease;
  width: 100%;

  &:focus {
    border-color: #1a1a1a;
    outline: none;
  }
`;

const SubmitButton = styled.button`
  padding: clamp(10px, 2vw, 14px);
  background: #ff4444;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: clamp(0.9rem, 2vw, 1.25rem);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  width: 100%;
  max-width: 300px;
  margin: 0 auto; /* Center button */

  &:hover {
    background: #cc3333;
  }
`;