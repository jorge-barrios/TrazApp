import React from "react";

interface InfoCardProps {
  icon: any;
  title: string;
  value: string | number;
  description?: string;
  colorClass?: string;
  accentColor?: string;
  onClick?: () => void;
  size?: 'default' | 'large';
  active?: boolean;
}

export default function InfoCard({
  icon: Icon,
  title,
  value,
  description,
  colorClass = "border-gray-600",
  onClick,
  size = 'default',
  active = false,
}: InfoCardProps) {
  return (
    <div 
      className={`
        bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 
        border-l-4 ${colorClass}
        ${active ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-blue-500' : ''}
        hover:bg-gray-800/80 transition-all cursor-pointer
        relative overflow-hidden
      `}
      onClick={onClick}
    >
      <div className={`flex items-center ${size === 'large' ? 'gap-4' : 'justify-between'}`}>
        <div className="flex-1">
          <p className={`font-medium truncate ${size === 'large' ? 'text-base' : 'text-sm'} text-gray-100`}>{title}</p>
          <p className={`font-bold ${size === 'large' ? 'text-4xl mt-2' : 'text-2xl mt-1'} text-white`}>{value}</p>
          {description && (
            <p className="text-xs text-gray-300 mt-1">{description}</p>
          )}
        </div>
        <Icon className={`${size === 'large' ? 'h-12 w-12' : 'h-8 w-8'} text-gray-300`} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 pointer-events-none" />
    </div>
  );
}
