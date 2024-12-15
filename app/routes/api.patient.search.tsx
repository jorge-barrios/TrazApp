import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { requireAuth } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { supabase, response } = await requireAuth(request);
  const url = new URL(request.url);
  const documentNumber = url.searchParams.get("documentNumber");

  if (!documentNumber) {
    return json({ error: "Número de documento requerido" }, { status: 400 });
  }

  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('document_number', documentNumber)
      .single();

    if (error) throw error;

    return json({ patient }, {
      headers: response.headers
    });

  } catch (error) {
    console.error('Error buscando paciente:', error);
    return json({ error: error.message }, { 
      status: 400,
      headers: response.headers
    });
  }
};
