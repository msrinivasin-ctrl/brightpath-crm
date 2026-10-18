import React from 'react';
import {
  Clock,
  ArrowRight,
  User,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { Lead, LeadStatus } from '../../types/crm';

interface LeadKanbanBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onAdvanceStatus: (leadId: string, nextStatus: LeadStatus) => void;
}

const COLUMNS: {
  status: LeadStatus;
  title: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}[] = [
  {
    status: 'new',
    title: 'New Inquiries',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-700',
    dotColor: 'bg-blue-500',
  },
  {
    status: 'contacted',
    title: 'Contacted',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-700',
    dotColor: 'bg-indigo-500',
  },
  {
    status: 'demo_scheduled',
    title: 'Demo Scheduled',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },
  {
    status: 'converted',
    title: 'Converted (Admitted)',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  {
    status: 'lost',
    title: 'Closed / Lost',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-700',
    dotColor: 'bg-rose-500',
  },
];

const nextStatusMap: Record<LeadStatus, LeadStatus | null> = {
  new: 'contacted',
  contacted: 'demo_scheduled',
  demo_scheduled: 'converted',
  converted: null,
  lost: null,
};

export const LeadKanbanBoard: React.FC<LeadKanbanBoardProps> = ({
  leads,
  onSelectLead,
  onAdvanceStatus,
}) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
      {COLUMNS.map((col) => {
        const columnLeads = leads.filter((l) => l.status === col.status);

        return (
          <div
            key={col.status}
            className="flex w-72 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50/75 p-3.5"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                <h4 className="text-xs font-bold text-slate-800">{col.title}</h4>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${col.badgeBg} ${col.badgeText}`}
              >
                {columnLeads.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto min-h-[300px]">
              {columnLeads.map((lead) => {
                const next = nextStatusMap[lead.status];
                const isOverdue =
                  lead.followUpDate &&
                  lead.followUpDate < today &&
                  lead.status !== 'converted' &&
                  lead.status !== 'lost';

                return (
                  <div
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {lead.studentName}
                        </h5>
                        {lead.gradeLevel && (
                          <span className="text-[10px] font-medium text-slate-400">
                            {lead.gradeLevel}
                          </span>
                        )}
                      </div>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 uppercase">
                        {lead.source.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] font-medium text-slate-700 line-clamp-1">
                      {lead.courseInterest}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-500">
                        <User className="h-3 w-3 text-slate-400" />
                        <span className="truncate max-w-[100px]">{lead.counselorAssigned}</span>
                      </div>

                      {lead.followUpDate && (
                        <div
                          className={`flex items-center gap-1 font-medium ${
                            isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          {isOverdue ? (
                            <AlertTriangle className="h-3 w-3 text-rose-500" />
                          ) : (
                            <Clock className="h-3 w-3 text-slate-400" />
                          )}
                          <span>{lead.followUpDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick advance button */}
                    {next && (
                      <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdvanceStatus(lead.id, next);
                          }}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <span>Move to {next.replace('_', ' ')}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {lead.status === 'converted' && (
                      <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Ready for Batch Enrollment</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {columnLeads.length === 0 && (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No inquiries
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
