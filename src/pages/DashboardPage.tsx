import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  GraduationCap,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Lead, Batch, Student, FeeRecord, LeadStatus } from '../types/crm';
import { leadService } from '../services/leadService';
import { courseService } from '../services/courseService';
import { studentService, getLocalFees } from '../services/studentService';
import { FollowUpTasksWidget } from '../components/tasks/FollowUpTasksWidget';
import { LeadDetailDrawer } from '../components/leads/LeadDetailDrawer';

export const DashboardPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [fees] = useState<FeeRecord[]>(getLocalFees);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const loadDashboardData = () => {
    leadService.getLeads().then((res) => setLeads(res.leads));
    courseService.getBatches().then(setBatches);
    studentService.getStudents().then(setStudents);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUpdateStatus = async (leadId: string, status: LeadStatus) => {
    const updated = await leadService.updateStatus(leadId, status);
    setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
  };

  const handleUpdateLead = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  };

  const activeLeadsCount = leads.filter((l) => l.status !== 'lost').length;
  const demosScheduledCount = leads.filter((l) => l.status === 'demo_scheduled').length;
  const totalStudentsCount = students.length;

  const totalFeeExpected = fees.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalFeeCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const collectionPercentage = totalFeeExpected > 0 ? Math.round((totalFeeCollected / totalFeeExpected) * 100) : 0;

  const stats = [
    {
      title: 'Active Inquiries',
      value: activeLeadsCount,
      change: '+14% vs last week',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Demos Scheduled',
      value: demosScheduledCount,
      change: 'Next: Oct 20 (Aarav)',
      icon: CalendarCheck,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Enrolled Students',
      value: totalStudentsCount,
      change: '2 Active Cohorts',
      icon: GraduationCap,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Fee Collection',
      value: `${collectionPercentage}%`,
      change: `$${totalFeeCollected} / $${totalFeeExpected}`,
      icon: TrendingUp,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-6 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            <span>Admissions Cycle • Fall 2026</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome to BrightPath CRM
          </h2>
          <p className="mt-2 text-sm text-indigo-100 leading-relaxed">
            Manage inquiries, streamline admissions, organize batches, and track fee
            collections all in one unified coaching operations platform.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/leads"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-indigo-900 shadow-sm hover:bg-indigo-50 transition-colors"
            >
              <span>View Inquiry Pipeline</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600/50 px-4 py-2 text-xs font-semibold text-white border border-white/20 hover:bg-indigo-600 transition-colors"
            >
              <span>Explore Batches</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-hover hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{stat.title}</span>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </span>
                <p className="mt-1 flex items-center text-xs font-medium text-slate-500">
                  <ArrowUpRight className="mr-1 h-3.5 w-3.5 text-emerald-500" />
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual Column Content: Recent Inquiries & Active Batches */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Inquiries (2 Columns on large) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Inquiries</h3>
              <p className="text-xs text-slate-500">
                Latest student inquiries waiting for follow-up
              </p>
            </div>
            <Link
              to="/leads"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all ({leads.length}) &rarr;
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {leads.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {lead.studentName}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        lead.status === 'new'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : lead.status === 'demo_scheduled'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : lead.status === 'converted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {lead.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{lead.courseInterest}</p>
                </div>
                <div className="text-right">
                  <span className="flex items-center justify-end text-xs text-slate-400">
                    <Clock className="mr-1 h-3 w-3" />
                    Follow-up: {lead.followUpDate}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600">
                    Counselor: {lead.counselorAssigned}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Batches status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900">Cohort Capacity</h3>
            <p className="text-xs text-slate-500">Active and upcoming batch limits</p>
          </div>

          <div className="mt-4 space-y-4">
            {batches.map((batch) => {
              const fillRate = Math.round((batch.enrolledCount / batch.capacity) * 100);
              return (
                <div key={batch.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="font-semibold text-slate-800">{batch.name}</span>
                    <span className="text-slate-500">
                      {batch.enrolledCount}/{batch.capacity} seats ({fillRate}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        fillRate >= 90
                          ? 'bg-rose-500'
                          : fillRate >= 70
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${fillRate}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">{batch.scheduleTime}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Counselor Action Center Tasks Widget */}
      <FollowUpTasksWidget
        leads={leads}
        onSelectLead={setSelectedLead}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLead}
      />
    </div>
  );
};
