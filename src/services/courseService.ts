import type { Course, Batch } from '../types/crm';
import { mockCourses, mockBatches } from '../data/mockData';

const LOCAL_STORAGE_COURSES = 'brightpath_courses';
const LOCAL_STORAGE_BATCHES = 'brightpath_batches';

const getLocalCourses = (): Course[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_COURSES);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_COURSES, JSON.stringify(mockCourses));
    return mockCourses;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return mockCourses;
  }
};

const saveLocalCourses = (courses: Course[]) => {
  localStorage.setItem(LOCAL_STORAGE_COURSES, JSON.stringify(courses));
};

const getLocalBatches = (): Batch[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_BATCHES);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_BATCHES, JSON.stringify(mockBatches));
    return mockBatches;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return mockBatches;
  }
};

const saveLocalBatches = (batches: Batch[]) => {
  localStorage.setItem(LOCAL_STORAGE_BATCHES, JSON.stringify(batches));
};

export const courseService = {
  async getCourses(): Promise<Course[]> {
    return getLocalCourses();
  },

  async createCourse(courseInput: Omit<Course, 'id'>): Promise<Course> {
    const newCourse: Course = {
      ...courseInput,
      id: 'c_' + Date.now(),
    };
    const current = getLocalCourses();
    const updated = [...current, newCourse];
    saveLocalCourses(updated);
    return newCourse;
  },

  async getBatches(): Promise<Batch[]> {
    return getLocalBatches();
  },

  async createBatch(batchInput: Omit<Batch, 'id' | 'enrolledCount'>): Promise<Batch> {
    const newBatch: Batch = {
      ...batchInput,
      id: 'b_' + Date.now(),
      enrolledCount: 0,
    };
    const current = getLocalBatches();
    const updated = [...current, newBatch];
    saveLocalBatches(updated);
    return newBatch;
  },

  async incrementBatchEnrollment(batchId: string): Promise<Batch> {
    const batches = getLocalBatches();
    const idx = batches.findIndex((b) => b.id === batchId);
    if (idx === -1) throw new Error('Batch not found');

    if (batches[idx].enrolledCount >= batches[idx].capacity) {
      throw new Error('Batch capacity reached! Cannot enroll more students.');
    }

    const updatedBatch: Batch = {
      ...batches[idx],
      enrolledCount: batches[idx].enrolledCount + 1,
    };
    batches[idx] = updatedBatch;
    saveLocalBatches(batches);
    return updatedBatch;
  },
};
