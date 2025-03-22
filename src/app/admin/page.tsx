// src/app/admin/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { useAdminContext } from "./AdminContext";

// Ensure paths match your file structure
const Users = dynamic(() => import("./users/page"), { ssr: false, loading: () => <div>Loading Users...</div> });
const Items = dynamic(() => import("./items/page"), { ssr: false, loading: () => <div>Loading Items...</div> });
const LostOrBroken = dynamic(() => import("./lost-or-broken/page"), { ssr: false, loading: () => <div>Loading LostOrBroken...</div> });

const AdminPanel = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeTab, setActiveTab } = useAdminContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const normalizedPath = pathname?.replace(/^\/admin\/?$/, "") || "home";
    const tabFromPath = normalizedPath === "" ? "home" : normalizedPath.split("/")[0]; // Handle nested paths
    console.log("Pathname:", pathname, "Normalized to tab:", tabFromPath, "Current activeTab:", activeTab);

    if (tabFromPath !== activeTab) {
      setActiveTab(tabFromPath);
      console.log("Updated activeTab to:", tabFromPath);
    }
  }, [pathname, activeTab, setActiveTab]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminStatus = await checkAdminStatus(user);
        setIsAdmin(adminStatus);
        if (!adminStatus) router.push("/admin/login");
      } else {
        setIsAdmin(false);
        router.push("/admin/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const checkAdminStatus = async (user: any) => {
    const adminEmails = ["vegarleeberentsen@gmail.com", "vegarberentsen@gmail.com"];
    return adminEmails.includes(user.email);
  };

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return null;

  console.log("AdminPanel render - activeTab:", activeTab);
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      {activeTab === "users" && <Users />}
      {activeTab === "items" && <Items />}
      {activeTab === "lost-or-broken" && <LostOrBroken />}
    </Suspense>
  );
};

export default AdminPanel;