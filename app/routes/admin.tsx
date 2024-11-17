// app/routes/admin.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import MainLayout from "~/components/layouts/MainLayout";
import { requireAdmin } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { response } = await requireAdmin(request);
  return json({}, { headers: response.headers });
}

export default function AdminLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}