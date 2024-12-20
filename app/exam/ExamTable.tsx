// app/components/exam/ExamTable.tsx
import { useState, useMemo, useRef, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@remix-run/react";
import ExamCard from "~/components/exam/ExamCard";
import { statusLabels, priorityLabels, priorityColors } from "~/utils/examUtils";
import { Exam } from "~/types";
import ExamStatusBadge from "./ExamStatusBadge";
import ExamPriorityBadge from "./ExamPriorityBadge";
import ExamActions from "./ExamActions";
import { formatDate } from "~/utils/dateFormatters";
import ClipboardDocumentListIcon from "@heroicons/react/24/outline";

interface ExamTableProps {
  exams: Exam[];
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Exam["status"]) => void;
  onExamClick?: (id: string) => void;
  statusFilter: string | null;
  tableStatusFilter: "all" | Exam["status"];
  priorityFilter: "all" | Exam["priority"];
  setTableStatusFilter: (value: "all" | Exam["status"]) => void;
  setPriorityFilter: (value: "all" | Exam["priority"]) => void;
}

const EmptyRow = () => (
  <tr className="h-[61px] bg-gray-800/50">
    <td colSpan={7} className="px-3 py-3.5" />
  </tr>
);

// Definimos los estados que corresponden a cada filtro de card
const cardFilterStates = {
  pending: ['registered', 'collected'],
  process: ['sent_to_lab', 'in_analysis'],
  completed: ['completed'],
  rejected: ['rejected']
} as const;

// Función para normalizar texto (remover tildes y otros caracteres especiales)
const normalizeText = (text: string) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

export default function ExamTable({
  exams,
  onDelete,
  onStatusChange,
  onExamClick,
  statusFilter,
  tableStatusFilter,
  priorityFilter,
  setTableStatusFilter,
  setPriorityFilter
}: ExamTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const ITEMS_PER_PAGE = 10;

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const searchNormalized = normalizeText(search);
      const matchesSearch =
        search === "" ||
        normalizeText(exam.patient_name || '').includes(searchNormalized) ||
        normalizeText(exam.exam_type || '').includes(searchNormalized) ||
        normalizeText(exam.id).includes(searchNormalized) ||
        normalizeText(exam.patient_document_number || '').includes(searchNormalized);

      // Filtro de estado de la tabla
      const matchesTableStatus = 
        tableStatusFilter === "all" || exam.status === tableStatusFilter;

      // Filtro de prioridad
      const matchesPriority =
        priorityFilter === "all" || exam.priority === priorityFilter;

      // Filtro de las cards
      let matchesCardFilter = true;
      if (statusFilter) {
        switch (statusFilter) {
          case 'pending':
            matchesCardFilter = exam.status === 'registered' || exam.status === 'collected';
            break;
          case 'process':
            matchesCardFilter = exam.status === 'sent_to_lab' || exam.status === 'in_analysis';
            break;
          case 'completed':
            matchesCardFilter = exam.status === 'completed';
            break;
          case 'rejected':
            matchesCardFilter = exam.status === 'rejected';
            break;
        }
      }

      return matchesSearch && matchesTableStatus && matchesPriority && matchesCardFilter;
    });
  }, [exams, search, tableStatusFilter, priorityFilter, statusFilter]);

  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calcular cuántas filas vacías necesitamos
  const emptyRows = ITEMS_PER_PAGE - paginatedExams.length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Función para obtener las opciones de estado según el filtro de card activo
  const getStatusOptions = () => {
    if (!statusFilter) {
      return Object.entries(statusLabels);
    }

    const allowedStates = cardFilterStates[statusFilter as keyof typeof cardFilterStates];
    return Object.entries(statusLabels).filter(([value]) => 
      allowedStates.includes(value as Exam["status"])
    );
  };

  // Sincronizar el filtro de tabla cuando cambia la selección de card
  useEffect(() => {
    if (statusFilter) {
      // Si la card seleccionada no incluye el estado actual, resetear a 'all'
      const allowedStates = cardFilterStates[statusFilter as keyof typeof cardFilterStates];
      if (tableStatusFilter !== 'all' && !allowedStates.includes(tableStatusFilter)) {
        setTableStatusFilter('all');
      }
    }
  }, [statusFilter, tableStatusFilter]);

  return (
    <div className="w-full">
      <div className="bg-gray-800/40 border border-gray-700 rounded-lg">
        <div className="p-3">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Buscador */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por paciente, RUN, tipo o ID..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-md 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-transparent"
                />
              </div>

              {/* Filtro de Estado */}
              <select
                value={tableStatusFilter}
                onChange={(e) => setTableStatusFilter(e.target.value as typeof tableStatusFilter)}
                className={`
                  w-full sm:w-auto bg-gray-800 border border-gray-600 text-white rounded-md py-2 px-3
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${statusFilter ? 'border-blue-500' : ''}
                `}
              >
                <option value="all">Todos los estados</option>
                {getStatusOptions().map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              {/* Filtro de Prioridad */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
                className="w-full sm:w-auto bg-gray-800 border border-gray-600 text-white rounded-md py-2 px-3
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!!statusFilter} // También podríamos deshabilitar el filtro de prioridad
              >
                <option value="all">Todas las prioridades</option>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table View (Desktop) */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <div className="rounded-md border border-gray-800">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="whitespace-nowrap px-3 py-3 text-left w-[200px] text-gray-300 font-semibold">ID</th>
                      <th className="whitespace-nowrap px-3 py-3 text-left text-gray-300 font-semibold">Paciente</th>
                      <th className="whitespace-nowrap px-3 py-3 text-left w-[100px] text-gray-300 font-semibold">Tipo</th>
                      <th className="whitespace-nowrap px-3 py-3 text-left w-[120px] text-gray-300 font-semibold">Estado</th>
                      <th className="whitespace-nowrap px-3 py-3 text-left w-[100px] text-gray-300 font-semibold">Prioridad</th>
                      <th className="whitespace-nowrap px-3 py-3 text-left w-[150px] text-gray-300 font-semibold">Fecha</th>
                      <th className="whitespace-nowrap px-3 py-3 text-right w-[100px] text-gray-300 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExams.map((exam, index) => (
                      <tr
                        key={exam.id}
                        className={`hover:bg-gray-700/50 cursor-pointer transition-colors ${
                          index % 2 === 0 ? 'bg-gray-800/40' : 'bg-gray-800/80'
                        }`}
                        onClick={() => onExamClick?.(exam.id)}
                      >
                        <td className="whitespace-nowrap px-3 py-3.5 text-sm text-gray-300">
                          {exam.id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-sm text-gray-300">
                          {exam.patient_name}
                          <div className="text-gray-500 text-xs">
                            {exam.patient_document_number}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-sm text-gray-300">
                          {exam.exam_type}
                        </td>
                        <td className="w-36 px-3 py-4 text-sm align-middle">
                          <ExamStatusBadge status={exam.status} />
                        </td>
                        <td className="w-36 px-3 py-4 text-sm align-middle">
                          <ExamPriorityBadge priority={exam.priority || "normal"} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-sm text-gray-300">
                          {formatDate(exam.created_at)}
                        </td>
                        <td className="relative whitespace-nowrap py-3.5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <ExamActions
                            exam={exam}
                            onDelete={() => onDelete?.(exam.id)}
                            onStatusChange={(status) => onStatusChange?.(exam.id, status)}
                          />
                        </td>
                      </tr>
                    ))}
                    {/* Filas vacías con el mismo patrón de alternancia */}
                    {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
                      <tr 
                        key={`empty-${index}`} 
                        className={`h-[61px] ${
                          (paginatedExams.length + index) % 2 === 0 ? 'bg-gray-800/40' : 'bg-gray-800/80'
                        }`}
                      >
                        <td colSpan={7} className="px-3 py-3.5" />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cards View (Mobile/Tablet) */}
          <div className="lg:hidden space-y-4 min-h-[600px]">
            {paginatedExams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onExamClick={onExamClick}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-700 px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-700"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-700"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Mostrando <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>{" "}
                    a{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredExams.length)}
                    </span>{" "}
                    de <span className="font-medium">{filteredExams.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md border border-gray-700 bg-gray-800 px-2 py-2 text-sm font-medium text-gray-400 hover:bg-gray-700 focus:z-20"
                    >
                      <span className="sr-only">Anterior</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md border border-gray-700 bg-gray-800 px-2 py-2 text-sm font-medium text-gray-400 hover:bg-gray-700 focus:z-20"
                    >
                      <span className="sr-only">Siguiente</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
