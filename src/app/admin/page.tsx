"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import Layout from "./Layout";

const Home = dynamic(() => import("./Home/page"), { ssr: false });
const Users = dynamic(() => import("./users/page"), { ssr: false });
const Items = dynamic(() => import("./items/page"), { ssr: false });
const Settings = dynamic(() => import("./settings/page"), { ssr: false });

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminStatus = await checkAdminStatus(user);
        setIsAdmin(adminStatus);
        if (!adminStatus) {
          router.push("/admin/login");
        }
      } else {
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

  const onTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (!isClient || loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#fff",
          color: "#1a1a1a",
        }}
      >
        Loading...
      </div>
    );
  if (!isAdmin) return null;

  return (
    <Layout activeTab={activeTab} onTabChange={onTabChange}>
      {activeTab === "home" && <Home />}
      {activeTab === "users" && <Users />}
      {activeTab === "items" && <Items />}
      {activeTab === "settings" && <Settings />}
    </Layout>
  );
};

export default AdminPanel;