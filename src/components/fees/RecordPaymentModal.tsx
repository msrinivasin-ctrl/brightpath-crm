import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Check, AlertCircle } from 'lucide-react';
import type { FeeRecord, PaymentTransaction } from '../../types/crm';
import { studentService } from '../../services/studentService';

interface RecordPaymentModalProps {
  isOpen: boolean;
  feeRecord: FeeRecord | null;
  onClose: () => void;
  onSuccess: (updatedFee: FeeRecord, transaction: PaymentTransaction) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  feeRecord,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<number>(feeRecord ? feeRecord.balanceAmount : 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction['paymentMethod']>('card');
  const [referenceNote, setReferenceNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !feeRecord) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (amount <= 0) {
      setErrorMessage('Payment amount must be greater than $0.');
      return;
    }

    if (amount > feeRecord.balanceAmount) {
      setErrorMessage(`Payment cannot exceed remaining balance of $${feeRecord.balanceAmount}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await studentService.recordPayment({
        feeRecordId: feeRecord.id,
        amount: Number(amount),
        paymentMethod,
        referenceNote: referenceNote.trim() || undefined,
      });

      onSuccess(result.fee, result.transaction);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Fee Payment</h3>
              <p className="text-xs text-slate-500">
                Log tuition deposit and issue official receipt.
              </p>
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

        {/* Student & Balance Summary */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/75 p-3.5 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Student:</span>
            <span className="font-bold text-slate-900">{feeRecord.studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Program:</span>
            <span className="font-medium text-slate-700">{feeRecord.courseName}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200/60 pt-1.5">
            <span className="text-slate-500">Total Tuition:</span>
            <span className="font-semibold text-slate-900">${feeRecord.totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Already Paid:</span>
            <span className="font-semibold text-emerald-600">${feeRecord.paidAmount}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-amber-700">
            <span>Remaining Balance:</span>
            <span>${feeRecord.balanceAmount}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Payment Amount ($) *
            </label>
            <div className="relative">
              <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="1"
                max={feeRecord.balanceAmount}
                step="10"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setAmount(feeRecord.balanceAmount)}
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                Pay Full Balance (${feeRecord.balanceAmount})
              </button>
              {feeRecord.balanceAmount > 100 && (
                <button
                  type="button"
                  onClick={() => setAmount(Math.round(feeRecord.balanceAmount / 2))}
                  className="text-[11px] font-semibold text-slate-500 hover:underline"
                >
                  Pay 50% (${Math.round(feeRecord.balanceAmount / 2)})
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentTransaction['paymentMethod'])
              }
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="card">Credit / Debit Card</option>
              <option value="bank_transfer">Bank Wire / ACH</option>
              <option value="online">Online Payment Gateway / UPI</option>
              <option value="cash">Cash at Institute Counter</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Transaction Reference / Note (Optional)
            </label>
            <input
              type="text"
              value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
              placeholder="e.g. Card ending 4821, Check #1049, Receipt note"
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? 'Recording...' : 'Confirm Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
