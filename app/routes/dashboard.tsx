import { FC, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BeakerIcon, ChartBarIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

// Inicializa Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://<YOUR_SUPABASE_URL>';
const supabaseKey = process.env.SUPABASE_KEY || '<YOUR_SUPABASE_KEY>';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ExamData {
  id: number;
  status: string;
  date: string;
}

const Dashboard: FC = () => {
  const [completedExams, setCompletedExams] = useState<number>(0);
  const [inProcessExams, setInProcessExams] = useState<number>(0);
  const [pendingExams, setPendingExams] = useState<number>(0);
  const [recentExams, setRecentExams] = useState<ExamData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('exams').select('*');

        if (error) {
          console.error('Error fetching data:', error);
        } else if (data) {
          // Filtra y cuenta los exámenes según el estado
          const completed = data.filter((exam: ExamData) => exam.status === 'completed').length;
          const inProcess = data.filter((exam: ExamData) => exam.status === 'in_process').length;
          const pending = data.filter((exam: ExamData) => exam.status === 'pending').length;

          setCompletedExams(completed);
          setInProcessExams(inProcess);
          setPendingExams(pending);
          setRecentExams(data.slice(-5)); // Últimos 5 exámenes
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-all">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bienvenido, [Usuario]</h1>
        <p className="text-gray-600 dark:text-gray-400">Resumen de Actividad</p>
      </header>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center">
            <BeakerIcon className="h-10 w-10 text-blue-600 dark:text-blue-400 mr-4" />
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Exámenes Completados</h2>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{loading ? '...' : completedExams}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center">
            <ClipboardDocumentCheckIcon className="h-10 w-10 text-green-600 dark:text-green-400 mr-4" />
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Exámenes en Proceso</h2>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{loading ? '...' : inProcessExams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center">
            <ChartBarIcon className="h-10 w-10 text-yellow-600 dark:text-yellow-400 mr-4" />
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Exámenes Pendientes</h2>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{loading ? '...' : pendingExams}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de últimos exámenes */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Últimos Exámenes Registrados</h2>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="py-2 px-4 text-gray-600 dark:text-gray-300">ID</th>
                <th className="py-2 px-4 text-gray-600 dark:text-gray-300">Estado</th>
                <th className="py-2 px-4 text-gray-600 dark:text-gray-300">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentExams.map((exam) => (
                <tr key={exam.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-2 px-4 text-gray-800 dark:text-white">{exam.id}</td>
                  <td className="py-2 px-4 text-gray-800 dark:text-white">{exam.status}</td>
                  <td className="py-2 px-4 text-gray-800 dark:text-white">{exam.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
