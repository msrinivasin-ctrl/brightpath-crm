import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  User,
  ArrowRight,
} from 'lucide-react';
import type { Lead, LeadStatus } from '../../types/crm';

interface FollowUpTasksWidgetProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
}

export const FollowUpTasksWidget: React.FC<FollowUpTasksWidgetProps> = ({
  leads,
  onSelectLead,
  onUpdateStatus,
}) => {
  const [selectedCounselor, setSelectedCounselor] = useState<string>('all');
  const today = new Date().toISOString().split('T')[0];

  const activeLeads = leads.filter(
    (l) => l.status !== 'converted' && l.status !== 'lost' && l.followUpDate
  );

  const counselorFiltered = activeLeads.filter((l) =>
    selectedCounselor === 'all' ? true : l.counselorAssigned === selectedCounselor
  );

  const overdue = counselorFiltered.filter((l) => l.followUpDate! < today);
  const dueToday = counselorFiltered.filter((l) => l.followUpDate === today);
  const upcoming = counselorFiltered.filter((l) => l.followUpDate! > today);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Widget Header & Counselor Filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Counselor Task Center</h3>
          <p className="text-xs text-slate-500">
            Pending student inquiry follow-ups and scheduled demo reminders.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <User className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={selectedCounselor}
            onChange={(e) => setSelectedCounselor(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Counselors</option>
            <option value="Sarah Jenkins">Sarah Jenkins</option>
            <option value="Michael Chang">Michael Chang</option>
          </select>
        </div>
      </div>

      {/* Overdue Section */}
      {overdue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <span>Overdue Action Items ({overdue.length})</span>
          </div>
          <div className="space-y-2">
            {overdue.map((lead) => (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50/40 p-3 hover:bg-rose-50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{lead.studentName}</span>
                    <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                      Due: {lead.followUpDate}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {lead.courseInterest} • Counselor: {lead.counselorAssigned}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${lead.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Phone className="h-3 w-3 text-emerald-600" />
                    <span>Call</span>
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(lead.id, 'contacted');
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-indigo-700"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Mark Contacted</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due Today Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
          <Clock className="h-4 w-4 text-amber-500" />
          <span>Scheduled for Today ({dueToday.length})</span>
        </div>
        {dueToday.length > 0 ? (
          <div className="space-y-2">
            {dueToday.map((lead) => (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="cursor-pointer rounded-lg border border-amber-200 bg-amber-50/40 p-3 hover:bg-amber-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900">{lead.studentName}</span>
                  <p className="text-[11px] text-slate-500">
                    {lead.courseInterest} • {lead.counselorAssigned}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLead(lead);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <span>Review Notes</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
            No callbacks scheduled specifically for today.
          </div>
        )}
      </div>

      {/* Upcoming Reminders */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <span>Upcoming Callbacks ({upcoming.length})</span>
        </div>
        <div className="space-y-1.5">
          {upcoming.slice(0, 3).map((lead) => (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className="cursor-pointer rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-slate-800">{lead.studentName}</span>
                <span className="text-[11px] text-slate-400 ml-2">{lead.courseInterest}</span>
              </div>
              <span className="text-[11px] font-medium text-slate-500">{lead.followUpDate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
