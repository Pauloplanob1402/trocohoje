import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BigButtonProps {
  icon: LucideIcon;
  label: string;
  subLabel?: string;
  colorClass: string;
  textColorClass: string;
  onClick: () => void;
}

export const BigButton: React.FC<BigButtonProps> = ({ icon: Icon, label, subLabel, colorClass, textColorClass, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`${colorClass} ${textColorClass} w-full py-6 px-4 rounded-3xl shadow-lg transform transition-transform active:scale-95 flex flex-col items-center justify-center gap-2 mb-4`}
    >
      <Icon size={48} strokeWidth={2.5} />
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black uppercase tracking-tight">{label}</span>
        {subLabel && <span className="text-sm font-medium opacity-80">{subLabel}</span>}
      </div>
    </button>
  );
};