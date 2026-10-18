import React from 'react';
import { BookOpen, Clock, DollarSign, Users } from 'lucide-react';
import { mockCourses, mockBatches } from '../data/mockData';

export const CoursesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Courses & Batches
        </h2>
        <p className="text-xs text-slate-500">
          Course curriculum, pricing, and active batch schedules for coaching programs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {mockCourses.map((course) => {
          const batches = mockBatches.filter((b) => b.courseId === course.id);
          return (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {course.code}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">{course.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{course.description}</p>

                <div className="mt-4 flex items-center gap-4 border-y border-slate-100 py-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{course.durationWeeks} Weeks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold text-slate-900">${course.totalFee}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <span className="capitalize">{course.category.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Batches section */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Active Batches:</h4>
                {batches.length > 0 ? (
                  <div className="space-y-2">
                    {batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="rounded-lg bg-slate-50 p-2.5 text-xs border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-800">{batch.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {batch.instructorName} • {batch.scheduleTime}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                            <Users className="h-3 w-3" />
                            {batch.enrolledCount}/{batch.capacity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No open batches scheduled.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
