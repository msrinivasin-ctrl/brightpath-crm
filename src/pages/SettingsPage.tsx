import React from 'react';
import { Database, ShieldCheck, CheckCircle2, Building, Users } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const SettingsPage: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'Not configured';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          System & Institute Settings
        </h2>
        <p className="text-xs text-slate-500">
          Manage institute credentials, counselor assignments, and database connection.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Institute Profile */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Institute Profile</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium">Institute Name</label>
              <p className="font-semibold text-slate-800">BrightPath Coaching Institute</p>
            </div>
            <div>
              <label className="text-slate-400 font-medium">Campus Location</label>
              <p className="text-slate-700">Central Academic District, Main Campus</p>
            </div>
            <div>
              <label className="text-slate-400 font-medium">Active Academic Session</label>
              <p className="text-slate-700">2026 - 2027 (Fall Admissions Open)</p>
            </div>
          </div>
        </div>

        {/* Supabase Connection Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Database & Persistence</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium">Provider</label>
              <p className="font-semibold text-slate-800">Supabase (PostgreSQL & Auth)</p>
            </div>
            <div>
              <label className="text-slate-400 font-medium">Endpoint URL</label>
              <p className="font-mono text-slate-700 truncate">{supabaseUrl}</p>
            </div>
            <div>
              <label className="text-slate-400 font-medium">Client Security</label>
              <div className="mt-1 flex items-center gap-1.5 text-emerald-600 font-medium">
                <ShieldCheck className="h-4 w-4" />
                <span>Publishable Anon Key Loaded (Safe for Client)</span>
              </div>
            </div>
            <div className="pt-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${
                  isSupabaseConfigured
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isSupabaseConfigured ? 'Supabase Configured in .env.local' : 'Missing Supabase Config'}
              </span>
            </div>
          </div>
        </div>

        {/* Counselors & Staff Roster */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Active Admissions Counselors</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-100">
              <p className="font-semibold text-slate-900">Sarah Jenkins</p>
              <p className="text-slate-500">Lead Admissions Counselor • Test Prep Division</p>
              <p className="mt-1 text-[11px] text-indigo-600 font-medium">Active Leads: 2 assigned</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-100">
              <p className="font-semibold text-slate-900">Michael Chang</p>
              <p className="text-slate-500">Senior Counselor • Medical & Engineering</p>
              <p className="mt-1 text-[11px] text-indigo-600 font-medium">Active Leads: 2 assigned</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
