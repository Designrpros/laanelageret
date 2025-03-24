"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { signInWithPopup, signInWithCredential, signOut, onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../../firebase";
import { useRouter, useSearchParams } from "next/navigation";

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

const GoogleLoginForm = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  // Check if running in iOS WKWebView
  const isIOSWebView =
    typeof window !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent) && window.webkit?.messageHandlers;

  useEffect(() => {
    // Listen for native iOS auth response
    const handleNativeAuth = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.idToken && detail?.accessToken) {
        const credential = GoogleAuthProvider.credential(detail.idToken, detail.accessToken);
        signInWithCredential(auth, credential)
          .then((result) => {
            console.log("[Login] Signed in with native credential:", result.user.email);
          })
          .catch((err) => {
            console.error("[Login] Error with native credential:", err);
            setError(getFirebaseErrorMessage(err));
          });
      }
    };

    window.addEventListener("authState", handleNativeAuth as EventListener);
    return () => window.removeEventListener("authState", handleNativeAuth as EventListener);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("[Login] User signed in:", currentUser.email, "UID:", currentUser.uid);
        setUser(currentUser);

        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            // Only set rentals and cart for new users
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
            console.log("[Login] New user document created in Firestore:", currentUser.uid);
          } else {
            // Update lastLogin only for existing users
            await setDoc(
              userRef,
              {
                lastLogin: new Date().toISOString(),
              },
              { merge: true }
            );
            console.log("[Login] Updated lastLogin for existing user:", currentUser.uid);
          }
        } catch (err) {
          console.error("[Login] Error updating Firestore:", err);
        }
        // Removed router.push(returnTo) to prevent redirect when already logged in
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []); // Removed router and returnTo from dependencies

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
        console.log("[Login] Google sign-in successful:", result.user.email);
      }
      router.push(returnTo); // Redirect only after successful sign-in
    } catch (error: any) {
      console.error("[Login] Google sign-in error:", error);
      setError(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      console.log("[Login] User signed out");
      setUser(null);
      router.push("/login");
    } catch (error: any) {
      console.error("[Login] Sign out error:", error);
      setError("Error signing out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFirebaseErrorMessage = (error: any): string => {
    switch (error.code) {
      case "auth/popup-closed-by-user":
        return "Sign-in popup closed.";
      case "auth/network-request-failed":
        return "Network error.";
      case "auth/too-many-requests":
        return "Too many attempts.";
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


