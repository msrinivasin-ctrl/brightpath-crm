import React from 'react';
import { Menu, Search, Bell, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6">
      {/* Left section: Mobile toggle & Search */}
      <div className="flex items-center gap-3 lg:gap-6">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden sm:block">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search leads, students, courses..."
            className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs text-slate-900 transition-all placeholder:text-slate-400 focus:w-80 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Right section: Action button, Notifications, Profile */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/leads?new=true')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Lead</span>
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs ring-2 ring-indigo-200">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden text-left md:block">
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              Sarah Jenkins
            </p>
            <p className="text-[11px] text-slate-500 leading-tight">
              Admissions Counselor
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
