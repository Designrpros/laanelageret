"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../../../firebase";
import { useRouter } from "next/navigation";

const AdminLogin = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const adminEmails = ["vegarleeberentsen@gmail.com"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const adminStatus = adminEmails.includes(user.email || "");
        setIsAdmin(adminStatus);
        if (adminStatus) {
          const token = await user.getIdToken();
          document.cookie = `authToken=${token}; path=/; max-age=3600`;
          if (window.location.pathname === "/admin/login") {
            router.push("/admin");
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        document.cookie = "authToken=; path=/; max-age=0";
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setError("Google login failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      document.cookie = "authToken=; path=/; max-age=0";
      router.push("/admin/login");
    } catch (error) {
      setError("Error signing out");
      console.error(error);
    }
  };

  if (user) {
    if (isAdmin) {
      return (
        <Container>
          <LoginForm>
            <WelcomeMessage>Welcome, Admin {user.email}!</WelcomeMessage>
            <Button onClick={handleSignOut}>Sign Out</Button>
          </LoginForm>
        </Container>
      );
    } else {
      return (
        <Container>
          <AccessDenied>
            <Title>Access Denied</Title>
            <Message>
              You do not have admin privileges. Please contact an administrator at{" "}
              <a href="mailto:admin@lanehuset.no">admin@lanehuset.no</a> to request access.
            </Message>
            <Button onClick={handleSignOut}>Sign Out</Button>
          </AccessDenied>
        </Container>
      );
    }
  }

  return (
    <Container>
      <LoginForm>
        <Title>Admin Login</Title>
        <Text>Sign in with your Google account to access the admin panel.</Text>
        <GoogleButton type="button" onClick={handleGoogleLogin} disabled={loading}>
          <GoogleLogo>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" width="20" height="20">
              <path
                fill="#4285f4"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              />
            </svg>
          </GoogleLogo>
          {loading ? "Signing in..." : "Sign in with Google"}
        </GoogleButton>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </LoginForm>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const LoginForm = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const AccessDenied = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
`;

const Text = styled.p`
  font-size: 1rem;
  color: #374151;
  margin-bottom: 1.5rem;
`;

const Message = styled.p`
  font-size: 1rem;
  color: #374151;
  margin-bottom: 1.5rem;
  a {
    color: #3b82f6;
    text-decoration: underline;
  }
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
  &:hover {
    background-color: #2563eb;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: white;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  transition: background-color 0.2s;
  &:hover {
    background-color: #f9fafb;
  }
`;

const GoogleLogo = styled.div`
  display: flex;
  align-items: center;
`;

const WelcomeMessage = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
`;

export default AdminLogin;