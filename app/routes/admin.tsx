// Archivo: /app/routes/admin.tsx
import { Outlet } from "@remix-run/react";
import MainLayout from "~/components/layouts/MainLayout";

export default function AdminLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}