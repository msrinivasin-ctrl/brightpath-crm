import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  BookOpen,
  Users,
} from 'lucide-react';
import type { Student, Course, Batch } from '../types/crm';
import { studentService } from '../services/studentService';
import { courseService } from '../services/courseService';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      studentService.getStudents(),
      courseService.getCourses(),
      courseService.getBatches(),
    ]).then(([sList, cList, bList]) => {
      setStudents(sList);
      setCourses(cList);
      setBatches(bList);
    });
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentIdNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm);
    const matchesCourse = selectedCourseId === 'all' || s.enrolledCourseId === selectedCourseId;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const activeCount = students.filter((s) => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Student Directory
            </h2>
            <p className="text-xs text-slate-500">
              Active coaching cohorts, student ID rosters, and parent communications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right shadow-2xs">
            <span className="text-[11px] font-medium text-slate-400">Total Enrolled</span>
            <p className="text-base font-bold text-slate-900 leading-none mt-0.5">
              {students.length} Students ({activeCount} Active)
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, ID number, or email..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Course selector filter */}
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          {/* Status chips */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            {['all', 'active', 'graduated', 'dropped'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 capitalize transition-colors font-medium ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Student Info</th>
              <th className="px-5 py-3.5">Student ID</th>
              <th className="px-5 py-3.5">Course & Cohort Batch</th>
              <th className="px-5 py-3.5">Enrollment Date</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((st) => {
              const course = courses.find((c) => c.id === st.enrolledCourseId);
              const batch = batches.find((b) => b.id === st.enrolledBatchId);

              return (
                <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{st.name}</div>
                    <div className="text-[11px] text-slate-500">Parent: {st.parentName}</div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {st.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {st.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-indigo-700">
                    <span className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                      {st.studentIdNumber}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">{course?.name || 'Assigned Course'}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Users className="h-3 w-3 text-slate-400" />
                      Cohort: {batch?.name || 'Cohort Batch'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {st.enrollmentDate}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize border ${
                        st.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : st.status === 'graduated'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  No students found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
