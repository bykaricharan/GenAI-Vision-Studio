import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#0F172A] py-6 text-slate-500 text-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-300">GenAI Vision Studio</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <span>Milestone 1 Foundation</span>
          <span className="h-1 w-1 rounded-full bg-slate-600"></span>
          <span className="text-[#38BDF8]">React 19 & TypeScript</span>
        </div>
      </div>
    </footer>
  );
};
