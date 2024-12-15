// app/routes/api.patients.$id.tsx
import { json, type LoaderFunction } from "@remix-run/node";
import { requireAuth } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const { supabase } = await requireAuth(request);
  const documentNumber = params.id;

  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select(`
        id,
        document_type,
        document_number,
        first_name,
        first_last_name,
        second_last_name,
        birth_date,
        gender,
        nationality,
        phone,
        region,
        commune,
        address,
        health_insurance,
        other_health_insurance
      `)
      .eq('document_number', documentNumber)
      .single();

    if (error) throw error;

    if (!patient) {
      return json({ patient: null }, { status: 404 });
    }

    return json({ patient });

  } catch (error) {
    console.error('Error buscando paciente:', error);
    return json(
      { error: 'Error al buscar paciente' },
      { status: 500 }
    );
  }
};