// src/app/admin/AdminClient.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { useAdminContext } from "./AdminContext";

const AdminClient = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeTab, onTabChange } = useAdminContext(); // Changed setActiveTab to onTabChange
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const normalizedPath = pathname?.replace(/^\/admin\/?$/, "") || "home";
    const tabFromPath = normalizedPath === "" ? "home" : normalizedPath.split("/")[0];
    console.log("Pathname:", pathname, "Normalized to tab:", tabFromPath, "Current activeTab:", activeTab);

    if (tabFromPath !== activeTab) {
      onTabChange(tabFromPath); // Changed setActiveTab to onTabChange
      console.log("Updated activeTab to:", tabFromPath);
    }
  }, [pathname, activeTab, onTabChange]); // Updated dependency

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

  console.log("AdminClient render - activeTab:", activeTab);
  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Active Tab: {activeTab}</p>
      {/* Add your tab content here later */}
    </div>
  );
};

export default AdminClient;