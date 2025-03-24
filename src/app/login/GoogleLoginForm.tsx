// src/app/login/GoogleLoginForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../../firebase";
import { useRouter, useSearchParams } from "next/navigation";

const GoogleLoginForm = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  useEffect(() => {
    // Listen for Firebase auth state (web)
    const unsubscribeFirebase = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("User signed in (Firebase):", currentUser.email, "UID:", currentUser.uid);
        setUser(currentUser);
        await updateFirestoreUser(currentUser);
        router.push(returnTo); // Redirect after successful login
      } else {
        setUser(null);
      }
    });

    // Listen for iOS bridge auth state
    const handleAuthState = (event: any) => {
      const authData = event.detail;
      if (authData?.email && authData?.token) {
        console.log("Auth state received from iOS:", authData.email);
        setUser({ email: authData.email, token: authData.token });
        // Optionally, redirect without Firebase if iOS handles auth fully
        router.push(returnTo);
      }
    };
    window.addEventListener("authState", handleAuthState);

    return () => {
      unsubscribeFirebase();
      window.removeEventListener("authState", handleAuthState);
    };
  }, [router, returnTo]);

  const updateFirestoreUser = async (currentUser: any) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userRef,
        {
          email: currentUser.email,
          createdAt: currentUser.metadata.creationTime || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          rentals: [],
          cart: { items: [] },
        },
        { merge: true }
      );
      console.log("User document updated in Firestore:", currentUser.uid);
    } catch (err) {
      console.error("Error updating user in Firestore:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if running in iOS WKWebView
      if (window.webkit?.messageHandlers?.signIn) {
        console.log("Triggering native Google login via iOS bridge");
        window.webkit.messageHandlers.signIn.postMessage("google");
      } else {
        // Fallback to Firebase popup for web
        console.log("Using Firebase signInWithPopup for web");
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Google sign-in successful:", result.user.email);
      }
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
      setUser(null);
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

  return (
    <FormContainer>
      {user ? (
        <>
          <WelcomeMessage>Welcome, {user.email}!</WelcomeMessage>
          <Button onClick={handleSignOut} disabled={loading}>
            {loading ? "Signing out..." : "Sign Out"}
          </Button>
        </>
      ) : (
        <>
          <Title>User Login</Title>
          <Button onClick={handleGoogleSignIn} disabled={loading}>
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </>
      )}
    </FormContainer>
  );
};

export default GoogleLoginForm;

// Styled components (unchanged)
const FormContainer = styled.div`
  background: white;
  font-family: "Helvetica", Arial, sans-serif;
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

