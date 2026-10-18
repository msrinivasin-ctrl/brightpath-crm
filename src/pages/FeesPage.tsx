import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  DollarSign,
  Printer,
  History,
} from 'lucide-react';
import type { FeeRecord, PaymentTransaction } from '../types/crm';
import { getLocalFees, studentService } from '../services/studentService';
import { RecordPaymentModal } from '../components/fees/RecordPaymentModal';
import { ReceiptModal } from '../components/fees/ReceiptModal';

export const FeesPage: React.FC = () => {
  const [fees, setFees] = useState<FeeRecord[]>(getLocalFees);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'records' | 'history'>('records');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<FeeRecord | null>(null);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<PaymentTransaction | null>(null);

  React.useEffect(() => {
    studentService.getTransactions().then(setTransactions);
  }, []);

  const totalReceivables = fees.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalPending = fees.reduce((acc, f) => acc + f.balanceAmount, 0);

  const filteredFees = fees.filter((fee) => {
    const matchesSearch =
      fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fee.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePaymentSuccess = (updatedFee: FeeRecord, transaction: PaymentTransaction) => {
    setFees((prev) => prev.map((f) => (f.id === updatedFee.id ? updatedFee : f)));
    setTransactions((prev) => [transaction, ...prev]);
    setSelectedReceiptTx(transaction);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Fee & Payment Management
          </h2>
          <p className="text-xs text-slate-500">
            Track student tuition dues, record installment payments, and generate official receipts.
          </p>
        </div>

        {/* View switcher between Ledgers and Transaction History */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold transition-colors ${
              activeTab === 'records'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>Student Accounts</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Payment History ({transactions.length})</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Tuition Billed</span>
          <p className="mt-2 text-2xl font-bold text-slate-900">${totalReceivables}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800">Total Collected</span>
          <p className="mt-2 text-2xl font-bold text-emerald-700">${totalCollected}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
          <span className="text-xs font-semibold text-amber-800">Pending Balances</span>
          <p className="mt-2 text-2xl font-bold text-amber-700">${totalPending}</p>
        </div>
      </div>

      {activeTab === 'records' ? (
        <>
          {/* Filters & Search Toolbar */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name or course..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {[
                { key: 'all', label: 'All Accounts' },
                { key: 'partially_paid', label: 'Partial Due' },
                { key: 'pending', label: 'Unpaid' },
                { key: 'paid', label: 'Fully Paid' },
              ].map((st) => (
                <button
                  key={st.key}
                  onClick={() => setStatusFilter(st.key)}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                    statusFilter === st.key
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fee Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Course Program</th>
                  <th className="px-5 py-3.5">Total Fee</th>
                  <th className="px-5 py-3.5">Paid Amount</th>
                  <th className="px-5 py-3.5">Balance Due</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900">{fee.studentName}</td>
                    <td className="px-5 py-4 text-slate-600">{fee.courseName}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">${fee.totalAmount}</td>
                    <td className="px-5 py-4 text-emerald-600 font-bold">${fee.paidAmount}</td>
                    <td className="px-5 py-4 font-bold text-amber-700">
                      ${fee.balanceAmount}
                    </td>
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
                          {fee.paymentStatus === 'partially_paid' ? 'Partial Due' : 'Pending'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {fee.balanceAmount > 0 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedFeeForPayment(fee)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>Record Payment</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-600">
                          Fully Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredFees.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                      No student accounts found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Payment Transactions History Table */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Receipt No</th>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Course</th>
                <th className="px-5 py-3.5">Payment Date</th>
                <th className="px-5 py-3.5">Mode</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-indigo-700">
                    {tx.receiptNumber}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{tx.studentName}</td>
                  <td className="px-5 py-4 text-slate-600">{tx.courseName}</td>
                  <td className="px-5 py-4 text-slate-500">{tx.paymentDate}</td>
                  <td className="px-5 py-4 font-medium text-slate-700 capitalize">
                    {tx.paymentMethod.replace('_', ' ')}
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-700">${tx.amount}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedReceiptTx(tx)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Printer className="h-3 w-3 text-slate-500" />
                      <span>View Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <RecordPaymentModal
        isOpen={Boolean(selectedFeeForPayment)}
        feeRecord={selectedFeeForPayment}
        onClose={() => setSelectedFeeForPayment(null)}
        onSuccess={handlePaymentSuccess}
      />

      <ReceiptModal
        isOpen={Boolean(selectedReceiptTx)}
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
      />
    </div>
  );
};
