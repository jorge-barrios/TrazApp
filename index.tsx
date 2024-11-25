import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ExamTable } from "~/components/exam/ExamTable";
import type { Exam } from "~/components/exam/types";

interface LoaderData {
  exams: Exam[];
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const exams = await getExams();
    return json<LoaderData>({ exams });
  } catch (error) {
    return json<LoaderData>({
      exams: [],
      error: 'Error al cargar los exámenes'
    });
  }
};

export default function ExamsIndex() {
  const { exams, error } = useLoaderData<LoaderData>();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Exámenes
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestiona y da seguimiento a los exámenes médicos
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4">
          {error}
        </div>
      )}

      <ExamTable exams={Array.isArray(exams) ? exams : []} />
    </div>
  );
}
