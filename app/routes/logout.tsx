// Archivo: /app/routes/logout.tsx
import { ActionFunction, redirect } from "@remix-run/node";
import { createServerSupabase } from "~/lib/supabase.server";

export const action: ActionFunction = async ({ request }) => {
  const response = new Response();
  const supabase = createServerSupabase(request, response);

  await supabase.auth.signOut();

  return redirect("/login", {
    headers: response.headers
  });
};