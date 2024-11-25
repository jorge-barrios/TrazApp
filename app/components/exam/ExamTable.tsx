// app/components/exam/ExamTable.tsx
import MainLayout from "~/components/layouts/MainLayout";
import { useState } from 'react';
import { Link } from '@remix-run/react';
import type { Exam } from '~/types/exam';
import ExamStatusBadge from './ExamStatusBadge';
import ExamPriorityBadge from './ExamPriorityBadge';
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface ExamTableProps {
  exams: Exam[];
}

const statusLabels = {
  'registered': 'Registrado',
  'pending': 'Pendiente',
  'in_process': 'En Proceso',
  'completed': 'Completado'
};

const priorityLabels = {
  'normal': 'Normal',
  'urgente': 'Urgente'
};

export default function ExamTable({ exams }: ExamTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filteredExams = exams.filter(exam => {
    const matchesSearch = (
      exam.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      exam.exam_type.toLowerCase().includes(search.toLowerCase())
    );
    const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || exam.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar exámenes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-md p-2"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-md p-2"
          >
            <option value="all">Todas las prioridades</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 
              flex items-center space-x-2 border border-gray-600"
          >
            <ClipboardDocumentListIcon className="h-5 w-5" />
            <span>Exportar</span>
          </button>
          <Link
            to="/exams/new"
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
              flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nuevo Examen</span>
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr className="bg-gray-900">
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Paciente
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Prioridad
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredExams.map((exam) => (
              <tr key={exam.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                  {exam.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {exam.patient_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {exam.exam_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <ExamStatusBadge status={exam.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <ExamPriorityBadge priority={exam.priority || 'normal'} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(exam.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/exams/${exam.id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Ver detalles
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredExams.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No se encontraron exámenes{search || statusFilter !== 'all' || priorityFilter !== 'all' 
              ? ' con los filtros actuales' 
              : ''
            }
          </div>
        )}
      </div>
    </div>
  );
}