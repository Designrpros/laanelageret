"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { signInWithPopup, signInWithCredential, signOut, onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";
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

  // Check if running in iOS WKWebView
  const isIOSWebView = typeof window !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent) && window.webkit?.messageHandlers;

  useEffect(() => {
    // Listen for native iOS auth response
    const handleNativeAuth = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.idToken && detail?.accessToken) {
        const credential = GoogleAuthProvider.credential(detail.idToken, detail.accessToken);
        signInWithCredential(auth, credential)
          .then((result) => {
            console.log("Signed in with native credential:", result.user.email);
            // onAuthStateChanged will handle redirect
          })
          .catch((err) => {
            console.error("Error with native credential:", err);
            setError(getFirebaseErrorMessage(err));
          });
      }
    };

    window.addEventListener("authState", handleNativeAuth as EventListener);
    return () => window.removeEventListener("authState", handleNativeAuth as EventListener);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userRef = doc(db, "users", user.uid);
          await setDoc(
            userRef,
            {
              email: user.email,
              createdAt: user.metadata.creationTime || new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              rentals: [],
              cart: { items: [] },
            },
            { merge: true }
          );
          console.log("User document updated in Firestore:", user.uid);
        } catch (err) {
          console.error("Error updating Firestore:", err);
        }
        router.push(returnTo);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [router, returnTo]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isIOSWebView) {
        // Trigger native iOS login
        window.webkit?.messageHandlers.signIn.postMessage({ action: "googleSignIn" });
      } else {
        // Web-based sign-in
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
      case "auth/popup-closed-by-user": return "Sign-in popup closed.";
      case "auth/network-request-failed": return "Network error.";
      case "auth/too-many-requests": return "Too many attempts.";
      default: return `Error: ${error.message}`;
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