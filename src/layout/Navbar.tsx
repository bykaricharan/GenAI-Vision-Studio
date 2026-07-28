import React from 'react';
import { NavLink } from 'react-router-dom';
import { Eye, Sparkles, LayoutDashboard, Home } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <NavLink 
          to="/" 
          className="flex items-center gap-3 transition-opacity hover:opacity-90 focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#38BDF8] text-white shadow-lg shadow-indigo-500/20">
            <Eye className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-50 flex items-center gap-1.5">
              GenAI Vision Studio
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-[#38BDF8] ring-1 ring-inset ring-indigo-500/20">
                <Sparkles className="mr-1 h-3 w-3" />
                v1.0
              </span>
            </span>
          </div>
        </NavLink>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/20 text-[#38BDF8] ring-1 ring-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/20 text-[#38BDF8] ring-1 ring-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
};
