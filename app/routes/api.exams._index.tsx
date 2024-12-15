import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { requireAuth } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request, params }) => {
  const { supabase, response } = await requireAuth(request);

  if (request.method === "DELETE") {
    const url = new URL(request.url);
    const examId = url.pathname.split("/").pop();

    const { error } = await supabase
      .from("exams")
      .delete()
      .eq("id", examId);

    if (error) {
      console.error("Error deleting exam:", error);
      throw new Response("Error al eliminar el examen", { status: 400 });
    }

    return json({ success: true }, { headers: response.headers });
  }

  throw new Response("Método no permitido", { status: 405 });
};
