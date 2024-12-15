// app/routes/api.patients.$id.tsx
import { json, type LoaderFunction } from "@remix-run/node";
import { requireAuth } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const { supabase } = await requireAuth(request);
  const documentNumber = params.id?.replace(/\./g, '').replace(/\-/g, '');

  const { data: patient, error } = await supabase
    .from('patients')
    .select()
    .eq('document_number', documentNumber)
    .single();

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ patient });
};