"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useRouter } from "next/navigation";

// Styled Components (shared)
const FormContainer = styled.div`
  background: white;
  font-family: "Helvetica", Arial, sans-serif;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const WelcomeMessage = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
  text-align: center;
  color: #1a1a1a;
  
`;

const LogoutNote = styled.p`
  font-size: 0.875rem;
  color: #666;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover:not(:disabled) {
    background-color: #333;
  }
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
  text-align: center;
`;

interface LogoutViewProps {
  user: any;
}

const LogoutView = ({ user }: LogoutViewProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      console.log("[Login] User signed out");
      router.push("/login");
    } catch (error: any) {
      console.error("[Login] Sign out error:", error);
      setError("Error signing out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <WelcomeMessage>Welcome, {user.email}!</WelcomeMessage>
      <LogoutNote>
        Dine utlån hos Låne Lageret venter på deg når du logger inn igjen.
      </LogoutNote>
      <Button onClick={handleSignOut} disabled={loading}>
        {loading ? "Signing out..." : "Sign Out"}
      </Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormContainer>
  );
};

export default LogoutView;