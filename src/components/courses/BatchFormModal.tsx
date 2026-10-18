import React, { useState } from 'react';
import { X, Calendar, AlertCircle, Check } from 'lucide-react';
import type { Course, Batch } from '../../types/crm';

interface BatchFormModalProps {
  isOpen: boolean;
  courses: Course[];
  initialCourseId?: string;
  onClose: () => void;
  onSubmit: (batch: Omit<Batch, 'id' | 'enrolledCount'>) => Promise<void>;
}

export const BatchFormModal: React.FC<BatchFormModalProps> = ({
  isOpen,
  courses,
  initialCourseId,
  onClose,
  onSubmit,
}) => {
  const [courseId, setCourseId] = useState(initialCourseId || courses[0]?.id || '');
  const [name, setName] = useState('');
  const [instructorName, setInstructorName] = useState('Dr. Evelyn Reed');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [scheduleTime, setScheduleTime] = useState('Sat & Sun 10:00 AM - 1:00 PM');
  const [capacity, setCapacity] = useState(25);
  const [status, setStatus] = useState<Batch['status']>('upcoming');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!courseId) {
      errs.courseId = 'Please select a course.';
    }
    if (!name.trim() || name.trim().length < 3) {
      errs.name = 'Batch name is required (min 3 characters).';
    }
    if (!instructorName.trim()) {
      errs.instructorName = 'Instructor name is required.';
    }
    if (!scheduleTime.trim()) {
      errs.scheduleTime = 'Please specify days and class timing.';
    }
    if (capacity <= 0 || capacity > 100) {
      errs.capacity = 'Capacity must be between 1 and 100 students.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        courseId,
        name: name.trim(),
        instructorName: instructorName.trim(),
        startDate,
        scheduleTime: scheduleTime.trim(),
        capacity: Number(capacity),
        status,
      });
      setName('');
      onClose();
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

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Schedule New Batch</h3>
              <p className="text-xs text-slate-500">
                Create a cohort batch with instructor and class timings.
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700">Associated Course *</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700">Batch Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SAT Weekend Intensive Cohort B"
              className={`mt-1 h-9 w-full rounded-lg border px-3 text-slate-900 focus:outline-none focus:ring-1 ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.name && (
              <p className="mt-1 flex items-center text-[11px] text-rose-600">
                <AlertCircle className="mr-1 h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700">Assigned Instructor *</label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="e.g. Dr. Evelyn Reed"
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Batch Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700">Schedule & Timings *</label>
              <input
                type="text"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                placeholder="e.g. Tue & Thu 4:00 PM - 7:00 PM"
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Maximum Seat Capacity *</label>
              <input
                type="number"
                min="1"
                max="100"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Batch['status'])}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="upcoming">Upcoming (Admissions Open)</option>
              <option value="ongoing">Ongoing</option>
            </select>
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? 'Scheduling...' : 'Schedule Batch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
