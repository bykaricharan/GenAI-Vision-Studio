import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  LayoutDashboard,
  Terminal,
  Database,
  Workflow,
  Bot,
  Eye,
  ShieldCheck,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  to: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Terminal, label: 'Prompt Engineering', to: '/prompt-engineering' },
  { icon: Database, label: 'Knowledge Studio', to: '/knowledge-studio' },
  { icon: Workflow, label: 'LangGraph Studio', to: '/langgraph-studio' },
  { icon: Bot, label: 'Multi-Agent Studio', to: '/multi-agent' },
  { icon: ShieldCheck, label: 'Evaluation Center', to: '/evaluation' },
  { icon: Eye, label: 'Observability', to: '/observability' },
  { icon: BookOpen, label: 'Architecture & Learning', to: '/architecture' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

export const Sidebar: React.FC = () => {
  const { settings, toggleSidebar } = useSettings();
  const isExpanded = !settings.isSidebarCollapsed;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 240 : 72 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col border-r border-border bg-card/90 text-muted-foreground select-none z-30 transition-colors duration-200"
    >
      {/* Toggle Button */}
      <div className="flex h-12 items-center justify-end px-3 pt-2">
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-[#1E293B] text-slate-400 hover:border-slate-700 hover:bg-slate-700/50 hover:text-slate-100 transition-colors cursor-pointer"
          title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 px-3 py-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `group relative flex h-11 items-center rounded-xl px-3 font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/20 text-[#38BDF8] ring-1 ring-indigo-500/30 font-bold'
                    : 'text-slate-400 hover:bg-[#1E293B] hover:text-slate-200'
                }`
              }
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              </div>

              {/* Text Label (shown when expanded) */}
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="ml-3 truncate text-sm"
                >
                  {item.label}
                </motion.span>
              )}

              {/* Tooltip Label (shown when collapsed) */}
              {!isExpanded && (
                <div className="absolute left-full ml-3 hidden rounded-md bg-[#1E293B] px-2.5 py-1 text-xs font-medium text-slate-200 shadow-md ring-1 ring-white/10 group-hover:block z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info inside Sidebar */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="flex items-center gap-3 px-2 py-2 text-xs text-slate-500">
          <Settings className="h-4 w-4 shrink-0" />
          {isExpanded && <span>System Ready</span>}
        </div>
      </div>
    </motion.aside>
  );
};
