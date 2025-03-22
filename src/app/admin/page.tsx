// src/app/admin/page.tsx
import { Suspense } from "react";
import { AdminProvider } from "./AdminContext";
import AdminClient from "./AdminClient";

export default function AdminPage() {
  return (
    <AdminProvider>
      <Suspense fallback={<div>Loading admin panel...</div>}>
        <AdminClient />
      </Suspense>
    </AdminProvider>
  );
}