import React, { useState } from 'react';
import { X, BookOpen, AlertCircle, Check } from 'lucide-react';
import type { Course, CourseCategory } from '../../types/crm';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (course: Omit<Course, 'id'>) => Promise<void>;
}

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CourseCategory>('test_prep');
  const [description, setDescription] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [totalFee, setTotalFee] = useState(1200);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!code.trim() || code.trim().length < 2) {
      errs.code = 'Course code is required (e.g. SAT-ADV).';
    }
    if (!name.trim() || name.trim().length < 3) {
      errs.name = 'Course name must be at least 3 characters.';
    }
    if (!description.trim() || description.trim().length < 10) {
      errs.description = 'Please provide a descriptive overview (min 10 chars).';
    }
    if (durationWeeks <= 0) {
      errs.durationWeeks = 'Duration must be at least 1 week.';
    }
    if (totalFee <= 0) {
      errs.totalFee = 'Tuition fee must be greater than 0.';
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
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category,
        description: description.trim(),
        durationWeeks: Number(durationWeeks),
        totalFee: Number(totalFee),
        isActive: true,
      });
      setCode('');
      setName('');
      setDescription('');
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Course</h3>
              <p className="text-xs text-slate-500">
                Define a new coaching program or academic curriculum.
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700">Course Code *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. AP-CALC"
                className={`mt-1 h-9 w-full rounded-lg border px-3 text-slate-900 focus:outline-none focus:ring-1 ${
                  errors.code
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.code && (
                <p className="mt-1 flex items-center text-[11px] text-rose-600">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {errors.code}
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CourseCategory)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="test_prep">Test Preparation</option>
                <option value="academic_k12">Academic K-12</option>
                <option value="language">Language & Communication</option>
                <option value="computer_science">Computer Science & STEM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700">Course Title *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AP Calculus BC Intensive"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700">Duration (Weeks) *</label>
              <input
                type="number"
                min="1"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Total Tuition Fee ($) *</label>
              <input
                type="number"
                min="0"
                step="50"
                value={totalFee}
                onChange={(e) => setTotalFee(Number(e.target.value))}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700">Course Description *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Syllabus highlights, prerequisite knowledge, target score outcomes..."
              className={`mt-1 w-full rounded-lg border p-3 text-slate-900 focus:outline-none focus:ring-1 ${
                errors.description
                  ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.description && (
              <p className="mt-1 flex items-center text-[11px] text-rose-600">
                <AlertCircle className="mr-1 h-3 w-3" />
                {errors.description}
              </p>
            )}
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
              <span>{isSubmitting ? 'Creating...' : 'Create Course'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
