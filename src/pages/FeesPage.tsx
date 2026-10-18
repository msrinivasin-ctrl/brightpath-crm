import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import type { FeeRecord } from '../types/crm';
import { getLocalFees } from '../services/studentService';

export const FeesPage: React.FC = () => {
  const [fees] = useState<FeeRecord[]>(getLocalFees);

  const totalReceivables = fees.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalPending = fees.reduce((acc, f) => acc + f.balanceAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Fee & Payment Management
        </h2>
        <p className="text-xs text-slate-500">
          Track installment plans, dues, receipts, and payment statuses.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Billed</span>
          <p className="mt-2 text-2xl font-bold text-slate-900">${totalReceivables}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
          <span className="text-xs font-medium text-emerald-800">Total Collected</span>
          <p className="mt-2 text-2xl font-bold text-emerald-700">${totalCollected}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
          <span className="text-xs font-medium text-amber-800">Pending Balances</span>
          <p className="mt-2 text-2xl font-bold text-amber-700">${totalPending}</p>
        </div>
      </div>

      {/* Fee Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Student</th>
              <th className="px-5 py-3.5">Course</th>
              <th className="px-5 py-3.5">Total Fee</th>
              <th className="px-5 py-3.5">Paid</th>
              <th className="px-5 py-3.5">Balance</th>
              <th className="px-5 py-3.5">Due Date</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fees.map((fee) => (
              <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4 font-semibold text-slate-900">{fee.studentName}</td>
                <td className="px-5 py-4 text-slate-600">{fee.courseName}</td>
                <td className="px-5 py-4 font-semibold text-slate-900">${fee.totalAmount}</td>
                <td className="px-5 py-4 text-emerald-600 font-semibold">${fee.paidAmount}</td>
                <td className="px-5 py-4 text-amber-600 font-semibold">${fee.balanceAmount}</td>
                <td className="px-5 py-4 text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {fee.dueDate}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {fee.paymentStatus === 'paid' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                      <Clock className="h-3 w-3" />
                      Partial Due
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
