import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Check } from 'lucide-react';
import type { Lead, LeadSource, LeadStatus } from '../../types/crm';
import { mockCourses } from '../../data/mockData';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Grade 11');
  const [courseInterest, setCourseInterest] = useState(mockCourses[0]?.name || '');
  const [source, setSource] = useState<LeadSource>('website');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [counselorAssigned, setCounselorAssigned] = useState('Sarah Jenkins');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!studentName.trim() || studentName.trim().length < 2) {
      errs.studentName = 'Student name is required (min 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    const cleanPhone = phone.replace(/[\s()-]/g, '');
    if (!phone.trim() || cleanPhone.length < 7) {
      errs.phone = 'Please enter a valid contact phone number (at least 7 digits).';
    }

    if (!courseInterest) {
      errs.courseInterest = 'Please select a program or course.';
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
        studentName: studentName.trim(),
        parentName: parentName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim(),
        gradeLevel,
        courseInterest,
        source,
        status,
        counselorAssigned,
        notes: notes.trim() || undefined,
        followUpDate: followUpDate || undefined,
      });
      // Reset form
      setStudentName('');
      setParentName('');
      setEmail('');
      setPhone('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error('Failed to create lead:', err);
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
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Register New Lead / Inquiry
              </h3>
              <p className="text-xs text-slate-500">
                Capture prospective student details and schedule counselor follow-up.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Student Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Liam Davis"
                className={`mt-1 h-9 w-full rounded-lg border px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.studentName
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.studentName && (
                <p className="mt-1 flex items-center text-[11px] text-rose-600">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {errors.studentName}
                </p>
              )}
            </div>

            {/* Parent Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Parent / Guardian Name
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Robert Davis"
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className={`mt-1 h-9 w-full rounded-lg border px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.email
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.email && (
                <p className="mt-1 flex items-center text-[11px] text-rose-600">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={`mt-1 h-9 w-full rounded-lg border px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.phone
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 flex items-center text-[11px] text-rose-600">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Grade Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Current Grade / Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
                <option value="College / Repeater">College / Repeater</option>
              </select>
            </div>

            {/* Program / Course of Interest */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Course of Interest <span className="text-rose-500">*</span>
              </label>
              <select
                value={courseInterest}
                onChange={(e) => setCourseInterest(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {mockCourses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} (${c.totalFee})
                  </option>
                ))}
              </select>
            </div>

            {/* Inquiry Source */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Inquiry Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="website">Website Form</option>
                <option value="walk_in">Campus Walk-in</option>
                <option value="referral">Student / Alumni Referral</option>
                <option value="social_media">Social Media Ad</option>
                <option value="phone_inquiry">Direct Phone Call</option>
              </select>
            </div>

            {/* Assigned Counselor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Assigned Counselor
              </label>
              <select
                value={counselorAssigned}
                onChange={(e) => setCounselorAssigned(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Sarah Jenkins">Sarah Jenkins (Test Prep)</option>
                <option value="Michael Chang">Michael Chang (STEM & Boards)</option>
              </select>
            </div>

            {/* Pipeline Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Initial Pipeline Stage
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="new">New Inquiry</option>
                <option value="contacted">Contacted</option>
                <option value="demo_scheduled">Demo Scheduled</option>
              </select>
            </div>

            {/* Follow-up Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Next Follow-Up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Counselor Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Initial Counselor Notes / Background
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Student inquiring for Nov batch. Weak in SAT Math section, requested weekend batch schedule."
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Action buttons */}
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register Inquiry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
