import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { mockLeads } from '../data/mockData';
import type { LeadStatus } from '../types/crm';

const statusBadges: Record<LeadStatus, { label: string; class: string }> = {
  new: { label: 'New Inquiry', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  contacted: { label: 'Contacted', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  demo_scheduled: { label: 'Demo Scheduled', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  converted: { label: 'Converted', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  lost: { label: 'Lost', class: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const LeadsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLeads = mockLeads.filter((lead) => {
    const matchesSearch =
      lead.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.courseInterest.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Leads & Inquiries
          </h2>
          <p className="text-xs text-slate-500">
            Track inquiries, schedule demos, and manage student admissions pipeline.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, course, or email..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          {['all', 'new', 'contacted', 'demo_scheduled', 'converted', 'lost'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-2.5 py-1 font-medium transition-colors capitalize ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Leads' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th scope="col" className="px-5 py-3.5">Student / Parent</th>
                <th scope="col" className="px-5 py-3.5">Course Interest</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5">Counselor</th>
                <th scope="col" className="px-5 py-3.5">Next Follow-Up</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => {
                const badge = statusBadges[lead.status];
                return (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{lead.studentName}</div>
                      {lead.parentName && (
                        <div className="text-[11px] text-slate-500">Parent: {lead.parentName}</div>
                      )}
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">{lead.courseInterest}</div>
                      <div className="text-[11px] text-indigo-600 font-medium">
                        Source: {lead.source.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.class}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-700 font-medium">{lead.counselorAssigned}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{lead.followUpDate || 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="h-3 w-3" />
                        Created: {lead.createdAt}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        View Notes
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phase 2 Callout */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
        <div className="text-xs">
          <p className="font-semibold text-indigo-900">Phase 2 Preview Ready</p>
          <p className="text-indigo-700 mt-0.5">
            Full input validation forms, interactive Kanban board drag-and-drop, and Supabase table synchronization will be implemented in Phase 2.
          </p>
        </div>
      </div>
    </div>
  );
};
