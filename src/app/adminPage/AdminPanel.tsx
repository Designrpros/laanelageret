"use client";

import React from "react";
import Layout from "./layout";
import Home from "./home/page";
import Users from "./users/page";
import Items from "./items/page";
import LostOrBroken from "./lost-or-broken/page";
import { useAdminContext } from "./AdminContext";

export default function AdminPanel() {
  const { activeTab } = useAdminContext();

  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "users":
        return <Users />;
      case "items":
        return <Items />;
      case "lost-or-broken":
        return <LostOrBroken />;
      default:
        return <div>Invalid tab</div>;
    }
  };

  return <Layout>{renderActiveTab()}</Layout>;
}