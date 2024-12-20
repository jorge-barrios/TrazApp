import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { formatDate } from "~/utils/dateFormatters";
import ExamStatusBadge from "~/exam/ExamStatusBadge";
import ExamPriorityBadge from "~/exam/ExamPriorityBadge";
import ExamActions from "~/exam/ExamActions";
import { Exam } from "~/types";
import {
  Card,
} from "~/components/ui/card";

interface ExamCardProps {
  exam: Exam;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Exam["status"]) => void;
  onExamClick?: (id: string) => void;
}

export default function ExamCard({
  exam,
  onDelete,
  onStatusChange,
  onExamClick,
}: ExamCardProps) {
  return (
    <Card
      className="mb-2 cursor-pointer hover:bg-gray-800/90"
      onClick={() => onExamClick?.(exam.id)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400" />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-medium">{exam.exam_type || "Sin tipo"}</span>
                <span className="text-xs text-gray-400">ID: {exam.id.slice(0, 8)}</span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm">{exam.patient_name || "N/A"}</span>
                <span className="text-xs text-gray-400">({exam.patient_document_number || "Sin documento"})</span>
              </div>
            </div>
          </div>
          <ExamPriorityBadge priority={exam.priority || "normal"} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExamStatusBadge status={exam.status} />
            <span className="text-xs text-gray-400">{formatDate(exam.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <ExamActions
              examId={exam.id}
              status={exam.status}
              exam={exam}
              onStatusChange={(newStatus) => onStatusChange?.(exam.id, newStatus)}
              onDelete={(e) => {
                e.stopPropagation();
                onDelete?.(exam.id);
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
