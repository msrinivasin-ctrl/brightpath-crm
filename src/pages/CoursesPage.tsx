import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  DollarSign,
  Users,
  Plus,
  Calendar,
  Filter,
} from 'lucide-react';
import type { Course, Batch } from '../types/crm';
import { courseService } from '../services/courseService';
import { CourseFormModal } from '../components/courses/CourseFormModal';
import { BatchFormModal } from '../components/courses/BatchFormModal';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedCourseForBatch, setSelectedCourseForBatch] = useState<string | undefined>(undefined);

  const loadData = () => {
    Promise.all([courseService.getCourses(), courseService.getBatches()]).then(
      ([cList, bList]) => {
        setCourses(cList);
        setBatches(bList);
      }
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCourse = async (newCourse: Omit<Course, 'id'>) => {
    const created = await courseService.createCourse(newCourse);
    setCourses((prev) => [...prev, created]);
  };

  const handleCreateBatch = async (newBatch: Omit<Batch, 'id' | 'enrolledCount'>) => {
    const created = await courseService.createBatch(newBatch);
    setBatches((prev) => [...prev, created]);
  };

  const filteredCourses = courses.filter((c) =>
    categoryFilter === 'all' ? true : c.category === categoryFilter
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Courses & Batches Management
          </h2>
          <p className="text-xs text-slate-500">
            Define coaching curricula, tuition rates, and manage cohort capacities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setSelectedCourseForBatch(undefined);
              setIsBatchModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>Schedule Batch</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCourseModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xs text-xs">
        <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
        <span className="font-semibold text-slate-600 mr-2">Category:</span>
        {[
          { key: 'all', label: 'All Programs' },
          { key: 'test_prep', label: 'Test Prep' },
          { key: 'academic_k12', label: 'Academic K-12' },
          { key: 'language', label: 'Language' },
          { key: 'computer_science', label: 'Computer Science' },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategoryFilter(cat.key)}
            className={`rounded-lg px-3 py-1 font-medium transition-colors ${
              categoryFilter === cat.key
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredCourses.map((course) => {
          const courseBatches = batches.filter((b) => b.courseId === course.id);
          const totalEnrolled = courseBatches.reduce((acc, b) => acc + b.enrolledCount, 0);
          const totalCapacity = courseBatches.reduce((acc, b) => acc + b.capacity, 0);

          return (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-hover hover:border-slate-300"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                    {course.code}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    Active Program
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900">{course.name}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {course.description}
                </p>

                {/* Course Metadata Bar */}
                <div className="mt-4 flex flex-wrap items-center gap-4 border-y border-slate-100 py-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{course.durationWeeks} Weeks</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span>${course.totalFee}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <span className="capitalize">{course.category.replace('_', ' ')}</span>
                  </div>
                  {totalCapacity > 0 && (
                    <div className="flex items-center gap-1.5 text-indigo-600 font-medium ml-auto">
                      <Users className="h-3.5 w-3.5" />
                      <span>{totalEnrolled} / {totalCapacity} Students</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Batches section */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">
                    Active & Upcoming Batches ({courseBatches.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourseForBatch(course.id);
                      setIsBatchModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Cohort</span>
                  </button>
                </div>

                {courseBatches.length > 0 ? (
                  <div className="space-y-2.5">
                    {courseBatches.map((batch) => {
                      const fillRate = Math.round((batch.enrolledCount / batch.capacity) * 100);
                      const isFull = batch.enrolledCount >= batch.capacity;

                      return (
                        <div
                          key={batch.id}
                          className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-100 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{batch.name}</p>
                              <p className="text-[11px] text-slate-500">
                                Instructor: {batch.instructorName} • Starts: {batch.startDate}
                              </p>
                              <p className="text-[11px] text-slate-400">{batch.scheduleTime}</p>
                            </div>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isFull
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : fillRate >= 75
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isFull ? 'FULL' : `${batch.enrolledCount}/${batch.capacity} seats`}
                            </span>
                          </div>

                          {/* Capacity progress bar */}
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full transition-all ${
                                fillRate >= 95
                                  ? 'bg-rose-500'
                                  : fillRate >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(fillRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                    No active cohorts scheduled for this course.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CourseFormModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSubmit={handleCreateCourse}
      />

      <BatchFormModal
        isOpen={isBatchModalOpen}
        courses={courses}
        initialCourseId={selectedCourseForBatch}
        onClose={() => setIsBatchModalOpen(false)}
        onSubmit={handleCreateBatch}
      />
    </div>
  );
};
