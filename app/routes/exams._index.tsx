import { json, redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate, useRouteError } from "@remix-run/react";
import { requireAuth } from "~/utils/auth.server";
import MainLayout from "~/components/layouts/MainLayout";
import { BeakerIcon, ChartBarIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useEffect } from "react";
import ExamTable from "~/components/exam/ExamTable";

// Tipos más específicos
interface ExamData {
  id: string;
  status: 'pending' | 'in_process' | 'completed';
  date: string;
  patient_name?: string;
  exam_type?: string;
}

interface LoaderData {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    full_name: string;
    role: string;
    node_id: string;
  };
  examStats: {
    completed: number;
    inProcess: number;
    pending: number;
  };
  recentExams: ExamData[];
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const { session, response, supabase } = await requireAuth(request);

    // Verificación explícita de la sesión
    if (!session?.user?.id) {
      throw redirect('/login');
    }

    // Obtener perfil con manejo de error explícito
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error al cargar perfil:', profileError);
      throw new Response('Error al cargar el perfil de usuario', { status: 400 });
    }

    // Solo intentar cargar exámenes si tenemos un perfil válido
    if (!profile) {
      throw new Response('Perfil de usuario no encontrado', { status: 404 });
    }

    // Obtener exámenes relacionados con el nodo del usuario
    const { data: exams, error: examsError } = await supabase
      .from('exams')
      .select(`
        id,
        status,
        created_at,
        patient_name,
        exam_type
      `)
      .eq('node_id', profile.node_id)
      .order('created_at', { ascending: false });

    if (examsError) {
      console.error('Error al cargar exámenes:', examsError);
      throw new Response('Error al cargar los exámenes', { status: 400 });
    }

    const formattedExams = (exams || []).map(exam => ({
      id: exam.id,
      status: exam.status,
      date: new Date(exam.created_at).toLocaleDateString(),
      patient_name: exam.patient_name,
      exam_type: exam.exam_type
    }));

    const examStats = {
      completed: formattedExams.filter(exam => exam.status === 'completed').length,
      inProcess: formattedExams.filter(exam => exam.status === 'in_process').length,
      pending: formattedExams.filter(exam => exam.status === 'pending').length
    };

    return json({
      user: session.user,
      profile,
      examStats,
      recentExams: formattedExams.slice(0, 5)
    }, {
      headers: response.headers
    });

  } catch (error) {
    // Si es una redirección, permitirla
    if (error instanceof Response && [301, 302, 303, 307, 308].includes(error.status)) {
      throw error;
    }

    // Si es un error de Response, mantenerlo
    if (error instanceof Response) {
      throw error;
    }

    // Para otros errores, log y respuesta genérica
    console.error('Error en dashboard loader:', error);
    throw new Response('Error interno del servidor', { status: 500 });
  }
};

// Componente para las tarjetas de estadísticas
function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  colorClass 
}: { 
  icon: any; 
  title: string; 
  value: number; 
  colorClass: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center">
        <Icon className={`h-10 w-10 ${colorClass} mr-4`} />
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h2>
          <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, profile, examStats, recentExams } = useLoaderData<LoaderData>();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-all">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bienvenido, {profile?.full_name || user.email}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Resumen de Actividad</p>
        </header>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={BeakerIcon}
            title="Exámenes Completados"
            value={examStats.completed}
            colorClass="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={ClipboardDocumentCheckIcon}
            title="Exámenes en Proceso"
            value={examStats.inProcess}
            colorClass="text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={ChartBarIcon}
            title="Exámenes Pendientes"
            value={examStats.pending}
            colorClass="text-yellow-600 dark:text-yellow-400"
          />
        </div>

        {/* Tabla de últimos exámenes con búsqueda y filtro */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Últimos Exámenes Registrados
            </h2>
            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              Ver todos
            </button>
          </div>

          {/* Búsqueda y Filtros */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="search"
                placeholder="Buscar exámenes..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800/40 border border-gray-700 rounded-lg 
                  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <select className="px-4 py-2 bg-gray-800/40 border border-gray-700 rounded-lg 
                text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="in_process">En Proceso</option>
                <option value="completed">Completado</option>
              </select>

              <select className="px-4 py-2 bg-gray-800/40 border border-gray-700 rounded-lg 
                text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Todas las prioridades</option>
                <option value="normal">Normal</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {/* Tabla de exámenes */}
          <ExamTable exams={recentExams} />
        </section>
      </div>
    </MainLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  
  let errorMessage = 'Error inesperado al cargar el dashboard';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error instanceof Response) {
    errorMessage = `Error ${error.status}: ${error.statusText || 'Error al cargar la información'}`;
  }

  // Si es un error de autenticación, redirigir al login
  useEffect(() => {
    if (error instanceof Response && error.status === 401) {
      navigate('/login');
    }
  }, [error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Error al cargar el dashboard
        </h1>
        <p className="text-gray-600 mb-4">
          {errorMessage}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('.')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Volver al login
          </button>
        </div>
      </div>
    </div>
  );
}