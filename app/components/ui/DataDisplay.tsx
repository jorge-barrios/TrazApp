// app/components/ui/DataDisplay.tsx
import { cn } from "~/lib/utils";

interface DetailCardProps {
  icon: any;
  title: string;
  children: React.ReactNode;
  colorClass?: string;
  className?: string;
}

export const DetailCard = ({ 
  icon: Icon, 
  title, 
  children, 
  colorClass = "bg-blue-600",
  className 
}: DetailCardProps) => (
  <div className={cn("bg-gray-800/40 p-6 rounded-lg", className)}>
    <div className="flex items-center space-x-4 mb-4">
      <div className={`p-3 ${colorClass} rounded-full`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <dt className="text-sm text-gray-400">{label}</dt>
    <dd className="text-white mt-1">{value || 'No especificado'}</dd>
  </div>
);