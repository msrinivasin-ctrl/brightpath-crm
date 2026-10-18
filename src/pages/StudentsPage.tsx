import React from 'react';
import { GraduationCap, Mail, Phone, Calendar } from 'lucide-react';
import { mockStudents, mockCourses } from '../data/mockData';

export const StudentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Enrolled Students
            </h2>
            <p className="text-xs text-slate-500">
              Active coaching cohorts, student IDs, and enrollment directories.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Student Info</th>
              <th className="px-5 py-3.5">Student ID</th>
              <th className="px-5 py-3.5">Enrolled Course</th>
              <th className="px-5 py-3.5">Enrollment Date</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockStudents.map((st) => {
              const course = mockCourses.find((c) => c.id === st.enrolledCourseId);
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
                  <td className="px-5 py-4 font-mono font-semibold text-indigo-600">
                    {st.studentIdNumber}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-slate-800">{course?.name}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {st.enrollmentDate}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200 capitalize">
                      {st.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
