"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError("Invalid email or password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setError("Error signing out");
      console.error(error);
    }
  };

  if (user) {
    return (
      <Container>
        <LoginForm>
          <WelcomeMessage>Welcome, {user.email}!</WelcomeMessage>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </LoginForm>
      </Container>
    );
  }

  return (
    <Container>
      <LoginForm onSubmit={handleEmailLogin}>
        <InputGroup>
          <label>Email</label>
          <Input 
            type="email" 
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </InputGroup>

        <InputGroup>
          <label>Password</label>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </InputGroup>

        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Separator>
          <Line />
          <span>OR</span>
          <Line />
        </Separator>

        <GoogleButton 
          type="button" 
          onClick={handleGoogleLogin} 
          disabled={loading}
        >
          <GoogleLogo>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" width="20" height="20">
              <path fill="#4285f4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
            </svg>
          </GoogleLogo>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </GoogleButton>
      </LoginForm>
    </Container>
  );
};

export default Login;

// Styled components - background-color: #f3f4f6;
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
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #374151;
    font-size: 0.875rem;
    font-weight: 500;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

const Separator = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  span {
    padding: 0 1rem;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const Line = styled.div`
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
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
  text-align: center;
`;

// Add the missing ErrorMessage styled component
const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
  text-align: center;
`;