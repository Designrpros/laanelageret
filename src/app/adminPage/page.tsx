// src/app/admin/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { auth } from "../../firebase"; // Adjust path to your firebase config
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import AdminPanel from "./AdminPanel";
import { ADMIN_EMAILS } from "../../../adminPrivileges"; // Adjust path as needed

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null); // Track email for debugging
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("[AdminPage] Auth state changed:", user ? user.email : "No user");
      if (user) {
        const email = user.email || "";
        setUserEmail(email);
        // Normalize email for case-insensitive comparison
        const isAdmin = ADMIN_EMAILS.some(
          (adminEmail) => adminEmail.toLowerCase() === email.toLowerCase()
        );
        console.log(`[AdminPage] Checking admin status - Email: ${email}, Is Admin: ${isAdmin}`);
        console.log("[AdminPage] Allowed admin emails:", ADMIN_EMAILS);
        setIsAuthorized(isAdmin);

        if (!isAdmin) {
          console.log("[AdminPage] Non-admin user, redirecting to home");
          router.push("/");
        }
      } else {
        console.log("[AdminPage] No user signed in, redirecting to login");
        setIsAuthorized(false);
        setUserEmail(null);
        router.push("/login?returnTo=/admin");
      }
    });

    return () => {
      console.log("[AdminPage] Unsubscribing from auth state listener");
      unsubscribe();
    };
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div>
        Loading admin access... (User: {userEmail || "Not signed in"})
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div>
        Access denied. Redirecting... (User: {userEmail || "Not signed in"})
      </div>
    );
  }

  return <AdminPanel />;
}