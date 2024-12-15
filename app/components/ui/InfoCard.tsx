import React from "react";

const InfoCard = ({
  icon: Icon,
  title,
  value,
  description,
  colorClass = "bg-blue-600",
  onClick,
}: {
  icon: any;
  title: string;
  value: string | number;
  description?: string;
  colorClass?: string;
  onClick?: () => void;
}) => (
  <div
    className={`bg-gray-800/40 p-6 rounded-lg hover:shadow-md transition-shadow duration-300 ${
      onClick ? "cursor-pointer" : ""
    }`}
    onClick={onClick}
  >
    <div className="flex items-center space-x-4">
      {/* Ícono destacado */}
      <div className={`p-3 ${colorClass} rounded-full`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      {/* Contenido textual */}
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

export default InfoCard;
