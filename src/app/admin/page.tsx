'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Layout from './Layout';

const Home = dynamic(() => import('./Home/page'), { ssr: false });
const Users = dynamic(() => import('./users/page'), { ssr: false });
const Items = dynamic(() => import('./items/page'), { ssr: false });
const Settings = dynamic(() => import('./settings/page'), { ssr: false });

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures we're running on the client side
  }, []);

  const onTabChange = (tab: string) => {
    setActiveTab(tab); // Only update the state, no routing
  };

  if (!isClient) return null;

  return (
    <Layout activeTab={activeTab} onTabChange={onTabChange}>
      {activeTab === 'home' && <Home />}
      {activeTab === 'users' && <Users />}
      {activeTab === 'items' && <Items />}
      {activeTab === 'settings' && <Settings />}
    </Layout>
  );
};

export default AdminPanel;