import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createServerSupabase } from "~/lib/supabase.server";
import { requireAdmin } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { response, supabase } = await requireAdmin(request);

  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      *,
      nodes:nodes (
        display_name,
        category
      )
    `)
    .order('full_name');

  if (error) throw error;

  return json({ users }, {
    headers: response.headers
  });
}

// Usar el mismo componente que estaba en admin/users
export default function AdminIndex() {
  const { users } = useLoaderData<typeof loader>();
  
  return (
    <div className="p-6">
      {/* Mismo contenido que tenías en admin/users pero aquí */}
      // ...existing code...
    </div>
  );
}
