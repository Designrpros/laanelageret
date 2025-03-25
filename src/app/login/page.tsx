"use client";

import { Suspense, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import LoginView from "./LoginView";
import LogoutView from "./LogoutView";

export default function LoginPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("[LoginPage] User signed in:", currentUser.email, "UID:", currentUser.uid);
        setUser(currentUser);

        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
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
            console.log("[LoginPage] New user document created in Firestore:", currentUser.uid);
          } else {
            await setDoc(
              userRef,
              { lastLogin: new Date().toISOString() },
              { merge: true }
            );
            console.log("[LoginPage] Updated lastLogin for existing user:", currentUser.uid);
          }
        } catch (err) {
          console.error("[LoginPage] Error updating Firestore:", err);
        }
      } else {
        setUser(null);
      }
      setLoading(false); // Authentication state resolved
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Suspense
        fallback={
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            Loading login...
          </h1>
        }
      >
        {loading ? (
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            Checking authentication...
          </h1>
        ) : user ? (
          <LogoutView user={user} />
        ) : (
          <LoginView />
        )}
      </Suspense>
    </div>
  );
}