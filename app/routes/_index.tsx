import { FC } from 'react';
import { ShieldCheckIcon, MagnifyingGlassIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const LandingPage: FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-600 to-teal-500 text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center h-screen text-center px-4">
        <h1 className="text-5xl font-extrabold mb-4">Bienvenido a Trazability</h1>
        <p className="text-lg max-w-2xl mb-8">
          La solución de trazabilidad para exámenes médicos que garantiza un seguimiento eficiente y seguro desde la toma de muestras hasta la entrega de resultados.
        </p>
        <a
          href="/login"
          className="bg-white text-blue-600 font-bold px-8 py-3 rounded shadow hover:bg-gray-100 transition"
        >
          Iniciar Sesión
        </a>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white text-gray-800 px-8">
        <h2 className="text-4xl font-bold text-center mb-10">Características de Trazability</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-4 shadow rounded bg-gray-50 flex flex-col items-center">
            <MagnifyingGlassIcon className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Seguimiento Completo</h3>
            <p>Monitorea cada etapa del proceso de los exámenes, desde la toma de muestras hasta la entrega.</p>
          </div>
          <div className="p-4 shadow rounded bg-gray-50 flex flex-col items-center">
            <ShieldCheckIcon className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Seguridad de Datos</h3>
            <p>Protección y manejo seguro de la información de los pacientes y resultados.</p>
          </div>
          <div className="p-4 shadow rounded bg-gray-50 flex flex-col items-center">
            <ChartBarIcon className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Informes Detallados</h3>
            <p>Genera informes imprimibles con códigos QR para un rastreo preciso y fácil de entender.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
