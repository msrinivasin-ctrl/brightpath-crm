export type LeadStatus = 'new' | 'contacted' | 'demo_scheduled' | 'converted' | 'lost';

export type LeadSource = 'website' | 'walk_in' | 'referral' | 'social_media' | 'phone_inquiry';

export type CourseCategory = 'test_prep' | 'academic_k12' | 'language' | 'computer_science';

export interface Lead {
  id: string;
  studentName: string;
  parentName?: string;
  email: string;
  phone: string;
  gradeLevel?: string;
  courseInterest: string;
  source: LeadSource;
  status: LeadStatus;
  counselorAssigned: string;
  notes?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  category: CourseCategory;
  description: string;
  durationWeeks: number;
  totalFee: number;
  isActive: boolean;
}

export interface Batch {
  id: string;
  courseId: string;
  name: string;
  instructorName: string;
  startDate: string;
  scheduleTime: string;
  capacity: number;
  enrolledCount: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Student {
  id: string;
  studentIdNumber: string;
  name: string;
  parentName: string;
  email: string;
  phone: string;
  enrolledCourseId: string;
  enrolledBatchId: string;
  enrollmentDate: string;
  status: 'active' | 'graduated' | 'dropped';
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  paymentStatus: 'pending' | 'partially_paid' | 'paid';
  lastPaymentDate?: string;
}

export interface ActivityLog {
  id: string;
  entityType: 'lead' | 'student';
  entityId: string;
  activityType: 'call' | 'email' | 'demo' | 'note' | 'status_change';
  summary: string;
  details?: string;
  performedBy: string;
  timestamp: string;
}
