// Archivo: /app/routes/_index.tsx
import { json, redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/utils/auth.server";
import MainLayout from "~/components/layouts/MainLayout";
import { useNavigate } from "@remix-run/react"; // <- Agregar useNavigate
import { 
  PlusIcon, 
  QrCodeIcon, 
  DocumentChartBarIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface LoaderData {
  user: {
    email: string;
    id: string;
  };
  profile: {
    full_name: string;
    node: {
      display_name: string;
      category: string;
    };
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const { session, response, supabase } = await requireAuth(request);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        node:nodes (
          display_name,
          category
        )
      `)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      return redirect("/login", {
        headers: response.headers
      });
    }

    return json({ 
      user: session.user,
      profile 
    }, {
      headers: response.headers
    });

  } catch (error) {
    return redirect("/login");
  }
};

// Componente para los botones de acción rápida
const QuickActionButton = ({ icon: Icon, text, onClick }: { icon: any, text: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center p-4 bg-gray-800/40 hover:bg-gray-800/60 rounded-lg transition-all space-y-2 group"
  >
    <div className="p-3 bg-blue-600 rounded-full group-hover:scale-110 transition-transform">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <span className="text-sm font-medium text-gray-300">
      {text}
    </span>
  </button>
);

// Componente para las tarjetas de información
const InfoCard = ({ 
  icon: Icon, 
  title, 
  value, 
  description 
}: { 
  icon: any;
  title: string;
  value: string | number;
  description?: string;
}) => (
  <div className="bg-gray-800/40 p-6 rounded-lg">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-blue-600 rounded-full">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  </div>
);

export default function Index() {
  const { user, profile } = useLoaderData<typeof loader>();
  const navigate = useNavigate(); // <- Agregar este hook

  return (
    <MainLayout>
      <div className="min-h-screen p-6 bg-gray-900">
        {/* Header y Bienvenida */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido, {profile?.full_name || user.email}
          </h1>
          <p className="text-gray-400">
            {profile.node.display_name} - {profile.node.category}
          </p>
        </div>

        {/* Acciones Rápidas */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              icon={PlusIcon}
              text="Nuevo Examen"
              onClick={() => navigate('/exam/new')}  // <- Agregar esta navegación
            />
            <QuickActionButton
              icon={QrCodeIcon}
              text="Escanear QR"
               onClick={() => navigate('/scan')} // <- Actualizar esta función
            />
            <QuickActionButton
              icon={DocumentChartBarIcon}
              text="Ver Reportes"
              onClick={() => {}}
            />
            <QuickActionButton
              icon={BuildingOfficeIcon}
              text="Info del Centro"
              onClick={() => {}}
            />
          </div>
        </section>

        {/* Resumen y Estadísticas */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Resumen del Centro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard
              icon={ArrowTrendingUpIcon}
              title="Eficiencia del Mes"
              value="94%"
              description="3% más que el mes anterior"
            />
            <InfoCard
              icon={DocumentChartBarIcon}
              title="Exámenes este Mes"
              value="126"
              description="32 pendientes"
            />
            <InfoCard
              icon={QrCodeIcon}
              title="Trazabilidad"
              value="98.5%"
              description="Últimos 30 días"
            />
          </div>
        </section>

        {/* Novedades o Anuncios */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            Novedades del Sistema
          </h2>
          <div className="bg-gray-800/40 rounded-lg p-6">
            <div className="space-y-4">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-medium text-white">
                  Nueva Funcionalidad
                </h3>
                <p className="text-gray-400">
                  Ahora puedes escanear múltiples códigos QR en lote para actualizar el estado de varios exámenes simultáneamente.
                </p>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="text-lg font-medium text-white">
                  Actualización de Seguridad
                </h3>
                <p className="text-gray-400">
                  Se han implementado mejoras en la seguridad del sistema de trazabilidad.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}