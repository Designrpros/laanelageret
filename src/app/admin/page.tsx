// src/app/admin/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import Layout from "./layout";
import { useAdminContext } from "./AdminContext";

const Home = dynamic(() => import("./home/page"), { ssr: false, loading: () => <div>Loading Home...</div> });
const Users = dynamic(() => import("./users/page"), { ssr: false, loading: () => <div>Loading Users...</div> });
const Items = dynamic(() => import("./items/page"), { ssr: false, loading: () => <div>Loading Items...</div> });
const LostOrBroken = dynamic(() => import("./lost-or-broken/page"), { ssr: false, loading: () => <div>Loading LostOrBroken...</div> });

const AdminPanel = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeTab, onTabChange } = useAdminContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tabFromPath = pathname?.replace(/^\/admin\/?$/, "") || "home";
    console.log("Pathname:", pathname, "Tab from path:", tabFromPath, "Current activeTab:", activeTab);
    if (tabFromPath !== activeTab) {
      onTabChange(tabFromPath);
      console.log("Synced activeTab to:", tabFromPath);
    }
  }, [pathname, activeTab, onTabChange]);

  useEffect(() => {
    console.log("Checking auth state...");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed - User:", user?.email || "none");
      if (user) {
        const adminStatus = await checkAdminStatus(user);
        console.log("Admin status:", adminStatus);
        setIsAdmin(adminStatus);
        if (!adminStatus) {
          console.log("Redirecting to /admin/login (not admin)");
          router.push("/admin/login");
        } else {
          const tabFromPath = pathname?.replace(/^\/admin\/?$/, "") || "home";
          if (tabFromPath !== activeTab) {
            const path = `/admin/${tabFromPath === "home" ? "" : tabFromPath}`;
            router.push(path, { scroll: false });
          }
        }
      } else {
        console.log("No user, redirecting to /admin/login");
        setIsAdmin(false);
        router.push("/admin/login");
      }
      setLoading(false);
    });
    return () => {
      console.log("Unsubscribing auth listener");
      unsubscribe();
    };
  }, [router, pathname, activeTab, onTabChange]);

  const checkAdminStatus = async (user: any) => {
    const adminEmails = ["vegarleeberentsen@gmail.com", "vegarberentsen@gmail.com"];
    return adminEmails.includes(user.email);
  };

  if (loading) {
    console.log("Rendering loading state");
    return <div>Loading...</div>;
  }
  if (!isAdmin) {
    console.log("User not admin, rendering null");
    return null;
  }

  console.log("AdminPanel render - activeTab:", activeTab);
  return (
    <Layout>
      <Suspense fallback={<div>Loading page...</div>}>
        {activeTab === "home" && <Home />}
        {activeTab === "users" && <Users />}
        {activeTab === "items" && <Items />}
        {activeTab === "lost-or-broken" && <LostOrBroken />}
      </Suspense>
    </Layout>
  );
};

export default AdminPanel;