"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { useRouter, useSearchParams } from "next/navigation";

const GoogleLoginForm = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user.email);
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [router, returnTo]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
      console.log("Google sign-in successful");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      setError(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      console.log("User signed out");
      router.push("/login");
    } catch (error: any) {
      console.error("Sign out error:", error);
      setError("Error signing out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFirebaseErrorMessage = (error: any): string => {
    switch (error.code) {
      case "auth/popup-closed-by-user":
        return "Sign-in popup closed. Please try again.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      default:
        return `Error: ${error.message}`;
    }
  };

  if (user) {
    return (
      <FormContainer>
        <WelcomeMessage>Welcome, {user.email}!</WelcomeMessage>
        <Button onClick={handleSignOut} disabled={loading}>
          {loading ? "Signing out..." : "Sign Out"}
        </Button>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <Title>User Login</Title>
      <Button onClick={handleGoogleSignIn} disabled={loading}>
        {loading ? "Signing in..." : "Sign in with Google"}
      </Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormContainer>
  );
};

// Styled components
const FormContainer = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #1a1a1a;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover:not(:disabled) {
    background-color: #2563eb;
  }
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const WelcomeMessage = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #1a1a1a;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
  text-align: center;
`;

export default GoogleLoginForm;