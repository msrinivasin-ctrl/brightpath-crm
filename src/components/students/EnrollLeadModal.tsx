import React, { useState, useEffect } from 'react';
import { X, GraduationCap, CheckCircle2, AlertCircle, Users, DollarSign } from 'lucide-react';
import type { Lead, Course, Batch } from '../../types/crm';
import { courseService } from '../../services/courseService';
import { studentService } from '../../services/studentService';

interface EnrollLeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onSuccess: (studentName: string, studentId: string) => void;
}

export const EnrollLeadModal: React.FC<EnrollLeadModalProps> = ({
  isOpen,
  lead,
  onClose,
  onSuccess,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      Promise.all([courseService.getCourses(), courseService.getBatches()]).then(
        ([cList, bList]) => {
          setCourses(cList);
          setBatches(bList);

          // Auto-select course based on lead's course interest if matched
          if (lead) {
            const matched = cList.find((c) =>
              lead.courseInterest.toLowerCase().includes(c.name.toLowerCase()) ||
              c.name.toLowerCase().includes(lead.courseInterest.toLowerCase())
            );
            const courseToSelect = matched || cList[0];
            if (courseToSelect) {
              setSelectedCourseId(courseToSelect.id);
              const courseBatches = bList.filter((b) => b.courseId === courseToSelect.id);
              if (courseBatches.length > 0) {
                setSelectedBatchId(courseBatches[0].id);
              }
            }
          }
        }
      );
    }
  }, [isOpen, lead]);

  // When selectedCourseId changes, adjust batches
  const availableBatches = batches.filter((b) => b.courseId === selectedCourseId);
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const selectedBatch = availableBatches.find((b) => b.id === selectedBatchId);

  if (!isOpen || !lead) return null;

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedCourse) {
      setErrorMessage('Please select a course.');
      return;
    }

    if (!selectedBatch) {
      setErrorMessage('Please select a batch.');
      return;
    }

    if (selectedBatch.enrolledCount >= selectedBatch.capacity) {
      setErrorMessage('Selected batch is already at full capacity. Please choose or create another batch.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { student } = await studentService.enrollLead({
        leadId: lead.id,
        studentName: lead.studentName,
        parentName: lead.parentName,
        email: lead.email,
        phone: lead.phone,
        course: selectedCourse,
        batch: selectedBatch,
      });

      onSuccess(student.name, student.studentIdNumber);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to enroll student.');
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

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Enroll Student in Batch
              </h3>
              <p className="text-xs text-slate-500">
                Convert lead to student, assign batch, and generate fee account.
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

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleEnroll} className="mt-4 space-y-4 text-xs">
          {/* Student Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-3.5 space-y-1">
            <span className="font-semibold text-slate-500 text-[10px] uppercase">Candidate</span>
            <p className="text-sm font-bold text-slate-900">{lead.studentName}</p>
            <p className="text-slate-500">
              {lead.email} • {lead.phone}
            </p>
            {lead.parentName && (
              <p className="text-[11px] text-slate-400">Parent: {lead.parentName}</p>
            )}
          </div>

          {/* Select Course */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Enrolling Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                const bList = batches.filter((b) => b.courseId === e.target.value);
                setSelectedBatchId(bList[0]?.id || '');
              }}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} (${c.totalFee})
                </option>
              ))}
            </select>
          </div>

          {/* Select Batch */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Assign Cohort Batch
            </label>
            {availableBatches.length > 0 ? (
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {availableBatches.map((b) => {
                  const isFull = b.enrolledCount >= b.capacity;
                  return (
                    <option key={b.id} value={b.id} disabled={isFull}>
                      {b.name} ({b.enrolledCount}/{b.capacity} seats) {isFull ? '— FULL' : ''}
                    </option>
                  );
                })}
              </select>
            ) : (
              <p className="text-slate-400 italic">No batches created for this course yet.</p>
            )}
          </div>

          {/* Batch & Fee Preview Box */}
          {selectedBatch && selectedCourse && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <Users className="h-3.5 w-3.5 text-indigo-600" />
                  Cohort Capacity:
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedBatch.enrolledCount} of {selectedBatch.capacity} seats filled
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  Course Tuition Billed:
                </span>
                <span className="font-bold text-slate-900">${selectedCourse.totalFee}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-indigo-100">
                Schedule: {selectedBatch.scheduleTime} (Instructor: {selectedBatch.instructorName})
              </p>
            </div>
          )}

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableBatches.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Enrolling...' : 'Confirm Enrollment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
