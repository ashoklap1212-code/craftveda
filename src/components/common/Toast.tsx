import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600" />,
    info: <Info className="w-5 h-5 text-terracotta-600" />,
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    error: 'bg-rose-50 border-rose-200 text-rose-950',
    info: 'bg-terracotta-50 border-terracotta-200 text-earth-900',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-sm">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-warm ${bgColors[toast.type]}`}>
        {icons[toast.type]}
        <p className="text-sm font-medium pr-2">{toast.message}</p>
      </div>
    </div>
  );
};
