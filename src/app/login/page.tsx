// No "use client" here - this is a Server Component
import { Suspense } from "react";
import LoginForm from "./LoginForm"; // Client Component with styled-components

export default function LoginPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Suspense fallback={<h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem", textAlign: "center" }}>Loading login...</h1>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}