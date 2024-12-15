// app/components/exam/ExamTable.tsx
import { useState, useMemo } from "react";
import type { Exam } from "~/types/exam";
import ExamStatusBadge from "./ExamStatusBadge";
import ExamPriorityBadge from "./ExamPriorityBadge";
import ExamActions from "./ExamActions";
import { formatDate } from "~/utils/dateFormatters";
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@remix-run/react";

interface ExamTableProps {
  exams: Exam[];
  onDelete: (examId: string) => Promise<void>;
  onStatusChange: (examId: string, newStatus: Exam["status"]) => Promise<void>;
  onExamClick: (examId: string) => void;
}

const statusLabels: Record<Exam["status"], string> = {
  registered: "Registrado",
  collected: "Recolectado",
  sent_to_lab: "Enviado a Laboratorio",
  in_analysis: "En Análisis",
  results_available: "Resultados Disponibles",
  completed: "Completado",
  rejected: "Rechazado",
} as const;

const priorityLabels: Record<NonNullable<Exam["priority"]>, string> = {
  normal: "Normal",
  urgent: "Urgente",
} as const;

export default function ExamTable({
  exams,
  onDelete,
  onStatusChange,
  onExamClick,
}: ExamTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Exam["status"]>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Exam["priority"]>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        exam.patient_name?.toLowerCase().includes(searchLower) ||
        exam.exam_type?.toLowerCase().includes(searchLower) ||
        exam.id.toLowerCase().includes(searchLower);
      const matchesStatus =
        statusFilter === "all" || exam.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || exam.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [exams, search, statusFilter, priorityFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="bg-gray-800 border-gray-700 rounded-lg">
      <div className="p-4">
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por paciente, tipo o ID..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-md 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-md transition-colors flex-shrink-0 ${
                  showFilters
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                title="Mostrar filtros"
              >
                <FunnelIcon className="h-5 w-5" />
              </button>

              <Link
                to="/exams/new"
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                  flex items-center gap-2 transition-colors flex-shrink-0"
              >
                <PlusIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Nuevo Examen</span>
              </Link>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-full sm:w-auto bg-gray-700 border border-gray-600 text-white rounded-md p-2 
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
                className="w-full sm:w-auto bg-gray-700 border border-gray-600 text-white rounded-md p-2 
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
          )}
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr className="bg-gray-900">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Paciente
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
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
                <tr
                  key={exam.id}
                  className="hover:bg-gray-700/50 transition-colors"
                >
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300 cursor-pointer"
                    onClick={() => onExamClick(exam.id)}
                  >
                    {exam.id.slice(0, 8)}...
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-white cursor-pointer"
                    onClick={() => onExamClick(exam.id)}
                  >
                    {exam.patient_name || "N/A"}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 cursor-pointer"
                    onClick={() => onExamClick(exam.id)}
                  >
                    {exam.exam_type || "N/A"}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm cursor-pointer"
                    onClick={() => onExamClick(exam.id)}
                  >
                    <ExamStatusBadge status={exam.status} />
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm cursor-pointer"
                    onClick={() => onExamClick(exam.id)}
                  >
                    <ExamPriorityBadge priority={exam.priority || "normal"} />
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 cursor-pointer"
                    onClick={() => onExamClick(exam.id)}
                  >
                    {formatDate(exam.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <ExamActions
                      examId={exam.id}
                      status={exam.status}
                      exam={exam}
                      onStatusChange={(newStatus) => onStatusChange(exam.id, newStatus)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onDelete(exam.id);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredExams.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No se encontraron exámenes
              {(search || statusFilter !== "all" || priorityFilter !== "all") &&
                " con los filtros actuales"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
