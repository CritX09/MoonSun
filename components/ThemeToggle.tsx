import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { AppTheme } from '../types';

interface ThemeToggleProps {
  currentTheme: AppTheme;
  onToggle: (theme: AppTheme) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentTheme, onToggle }) => {
  const isSunshine = currentTheme === AppTheme.SUNSHINE;

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <button
        onClick={() => onToggle(AppTheme.SUNSHINE)}
        className={`p-4 rounded-full transition-all duration-500 flex items-center gap-2 ${
          isSunshine
            ? 'bg-orange-400 text-white shadow-[0_0_30px_rgba(251,146,60,0.6)] scale-110'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
      >
        <Sun size={24} className={isSunshine ? 'animate-spin-slow' : ''} />
        <span className="font-bold hidden md:block">SUNSHINE MODE</span>
      </button>

      <div className="h-1 w-16 bg-gradient-to-r from-orange-400 to-indigo-500 rounded-full opacity-50" />

      <button
        onClick={() => onToggle(AppTheme.MOONLIGHT)}
        className={`p-4 rounded-full transition-all duration-500 flex items-center gap-2 ${
          !isSunshine
            ? 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.6)] scale-110'
            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
        }`}
      >
        <Moon size={24} className={!isSunshine ? 'animate-pulse' : ''} />
        <span className="font-bold hidden md:block">MOONLIGHT MODE</span>
      </button>
    </div>
  );
};
