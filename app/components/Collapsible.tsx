import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface CollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const Collapsible = ({ title, defaultOpen = true, children }: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        className="w-full px-4 py-3 flex justify-between items-center bg-gray-800 hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <h2 className="text-lg font-medium text-white">{title}</h2>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>
      <div 
        className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 bg-gray-900">
          {children}
        </div>
      </div>
    </div>
  );
};
