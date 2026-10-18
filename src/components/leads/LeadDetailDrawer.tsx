import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  User,
  Calendar,
  Send,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import type { Lead, LeadStatus, ActivityLog } from '../../types/crm';
import { leadService } from '../../services/leadService';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (updated: Lead) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  onClose,
  onUpdateLead,
}) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [newNote, setNewNote] = useState('');
  const [activityType, setActivityType] = useState<ActivityLog['activityType']>('call');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      leadService.getActivities(lead.id).then(setActivities);
    }
  }, [lead]);

  if (!lead) return null;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as LeadStatus;
    const updated = await leadService.updateStatus(lead.id, nextStatus);
    onUpdateLead(updated);

    // Automatically log status change
    const act = await leadService.addActivity({
      entityType: 'lead',
      entityId: lead.id,
      activityType: 'status_change',
      summary: `Pipeline status updated to ${nextStatus.replace('_', ' ')}`,
      performedBy: 'Sarah Jenkins',
    });
    setActivities((prev) => [act, ...prev]);
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextDate = e.target.value;
    const updated = await leadService.updateLead(lead.id, { followUpDate: nextDate });
    onUpdateLead(updated);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSaving(true);
    try {
      const act = await leadService.addActivity({
        entityType: 'lead',
        entityId: lead.id,
        activityType,
        summary: newNote.trim(),
        performedBy: 'Sarah Jenkins',
      });
      setActivities((prev) => [act, ...prev]);
      setNewNote('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
                {lead.studentName.charAt(0)}
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{lead.studentName}</h3>
                <p className="text-[11px] text-slate-500">ID: {lead.id}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* Status & Stage Selector */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Pipeline Stage</span>
                <select
                  value={lead.status}
                  onChange={handleStatusChange}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="new">New Inquiry</option>
                  <option value="contacted">Contacted</option>
                  <option value="demo_scheduled">Demo Scheduled</option>
                  <option value="converted">Converted (Enrolled)</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {/* Follow up date */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Follow-Up Date
                </span>
                <input
                  type="date"
                  value={lead.followUpDate || ''}
                  onChange={handleDateChange}
                  className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Contact Details
              </h4>
              <div className="rounded-xl border border-slate-200 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Student Phone</span>
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1 font-semibold text-indigo-600 hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email Address</span>
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-1 font-semibold text-indigo-600 hover:underline truncate max-w-[200px]"
                  >
                    <Mail className="h-3 w-3" />
                    {lead.email}
                  </a>
                </div>
                {lead.parentName && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Parent Name</span>
                    <span className="font-medium text-slate-800">{lead.parentName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned Counselor</span>
                  <span className="flex items-center gap-1 font-medium text-slate-800">
                    <User className="h-3 w-3 text-slate-400" />
                    {lead.counselorAssigned}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Interest */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Academic Interest
              </h4>
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-800">{lead.courseInterest}</span>
                </div>
                {lead.gradeLevel && (
                  <p className="text-slate-500">Grade Level: {lead.gradeLevel}</p>
                )}
                <p className="text-slate-500">Source: {lead.source.replace('_', ' ')}</p>
                {lead.notes && (
                  <div className="mt-2 rounded-lg bg-amber-50/60 border border-amber-100 p-2.5 text-slate-700">
                    <span className="font-semibold text-amber-900 block mb-0.5">Initial Notes:</span>
                    {lead.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Counselor Activity Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Counselor Activity & Notes
                </h4>
                <span className="text-[11px] text-slate-400">{activities.length} logs</span>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <div className="flex gap-2">
                  <select
                    value={activityType}
                    onChange={(e) =>
                      setActivityType(e.target.value as ActivityLog['activityType'])
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="call">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="demo">Demo Class</option>
                    <option value="note">General Note</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log a conversation, demo response, or follow-up note..."
                    className="h-8 flex-1 rounded-lg border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isSaving || !newNote.trim()}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </form>

              {/* Activity List */}
              <div className="space-y-2 pt-2">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-indigo-600 uppercase">
                        {act.activityType.replace('_', ' ')}
                      </span>
                      <span>{act.timestamp.split('T')[0]}</span>
                    </div>
                    <p className="text-xs text-slate-800">{act.summary}</p>
                    <p className="text-[10px] text-slate-400">Logged by: {act.performedBy}</p>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-3 italic">
                    No activity logs recorded yet. Add one above.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-slate-200 p-4 bg-slate-50">
            <button
              type="button"
              onClick={() => {
                alert(
                  `Enrolling ${lead.studentName} into ${lead.courseInterest}. (Full batch assignment connects in Phase 3!)`
                );
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>Enroll Student in Batch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
