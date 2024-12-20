// app/components/exam/ExamTable.tsx
import { useState, useMemo } from "react";
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
}

export default function ExamTable({
  exams,
  onDelete,
  onStatusChange,
  onExamClick,
}: ExamTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Exam["status"]>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Exam["priority"]>("all");
  const [showFilters, setShowFilters] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        exam.patient_name?.toLowerCase().includes(searchLower) ||
        exam.exam_type?.toLowerCase().includes(searchLower) ||
        exam.id.toLowerCase().includes(searchLower) ||
        exam.patient_document_number?.toLowerCase().includes(searchLower);
      const matchesStatus =
        statusFilter === "all" || exam.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || exam.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [exams, search, statusFilter, priorityFilter]);

  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="w-full">
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="p-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            {/* Search Bar and Filters */}
            <div className="w-full sm:flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-full sm:w-auto bg-gray-800 border border-gray-600 text-white rounded-md py-2 px-3
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
                className="w-full sm:w-auto bg-gray-800 border border-gray-600 text-white rounded-md py-2 px-3
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las prioridades</option>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* New Exam Button */}
            <Link
              to="/exams/new"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                flex items-center justify-center gap-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Nuevo Examen</span>
            </Link>
          </div>

          {/* Table View (Desktop) */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300 border-b border-gray-700">
                      ID
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300 border-b border-gray-700">
                      Paciente
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300 border-b border-gray-700">
                      Tipo
                    </th>
                    <th scope="col" className="w-36 px-3 py-3.5 text-left text-sm font-semibold text-gray-300 border-b border-gray-700">
                      Estado
                    </th>
                    <th scope="col" className="w-36 px-3 py-3.5 text-left text-sm font-semibold text-gray-300 border-b border-gray-700">
                      Prioridad
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300 border-b border-gray-700">
                      Fecha
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 border-b border-gray-700">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {paginatedExams.map((exam, index) => (
                    <tr
                      key={exam.id}
                      className={`hover:bg-gray-700/50 cursor-pointer transition-colors ${
                        index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'
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
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards View (Mobile/Tablet) */}
          <div className="lg:hidden space-y-4">
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
