import type { Student, FeeRecord, Course, Batch, PaymentTransaction } from '../types/crm';
import { mockStudents, mockFees } from '../data/mockData';
import { courseService } from './courseService';
import { leadService } from './leadService';

const LOCAL_STORAGE_STUDENTS = 'brightpath_students';
const LOCAL_STORAGE_FEES = 'brightpath_fees';
const LOCAL_STORAGE_TRANSACTIONS = 'brightpath_transactions';

const initialTransactions: PaymentTransaction[] = [
  {
    id: 'tx_1',
    feeRecordId: 'f2',
    studentId: 's2',
    studentName: 'Kavita Menon',
    courseName: 'SAT Master Prep (Math & English)',
    amount: 1200,
    paymentMethod: 'card',
    referenceNote: 'Full tuition payment paid at admission',
    receiptNumber: 'RCP-2026-1001',
    paymentDate: '2026-09-28',
  },
  {
    id: 'tx_2',
    feeRecordId: 'f1',
    studentId: 's1',
    studentName: 'Maya Lin',
    courseName: 'Grade 10 & 12 Board Exam Accelerator',
    amount: 500,
    paymentMethod: 'bank_transfer',
    referenceNote: 'First installment deposit',
    receiptNumber: 'RCP-2026-1002',
    paymentDate: '2026-10-15',
  },
];

const getLocalTransactions = (): PaymentTransaction[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS, JSON.stringify(initialTransactions));
    return initialTransactions;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialTransactions;
  }
};

const saveLocalTransactions = (txs: PaymentTransaction[]) => {
  localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS, JSON.stringify(txs));
};

const getLocalStudents = (): Student[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_STUDENTS);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_STUDENTS, JSON.stringify(mockStudents));
    return mockStudents;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return mockStudents;
  }
};

const saveLocalStudents = (students: Student[]) => {
  localStorage.setItem(LOCAL_STORAGE_STUDENTS, JSON.stringify(students));
};

export const getLocalFees = (): FeeRecord[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_FEES);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_FEES, JSON.stringify(mockFees));
    return mockFees;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return mockFees;
  }
};

export const saveLocalFees = (fees: FeeRecord[]) => {
  localStorage.setItem(LOCAL_STORAGE_FEES, JSON.stringify(fees));
};

export const studentService = {
  async getStudents(): Promise<Student[]> {
    return getLocalStudents();
  },

  async enrollLead(params: {
    leadId: string;
    studentName: string;
    parentName?: string;
    email: string;
    phone: string;
    course: Course;
    batch: Batch;
  }): Promise<{ student: Student; fee: FeeRecord }> {
    // 1. Increment batch seat capacity
    await courseService.incrementBatchEnrollment(params.batch.id);

    // 2. Generate Student ID
    const currentStudents = getLocalStudents();
    const nextSeq = 40 + currentStudents.length + 1;
    const studentIdNumber = `BP-2026-${String(nextSeq).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    // 3. Create Student record
    const newStudent: Student = {
      id: 's_' + Date.now(),
      studentIdNumber,
      name: params.studentName,
      parentName: params.parentName || 'N/A',
      email: params.email,
      phone: params.phone,
      enrolledCourseId: params.course.id,
      enrolledBatchId: params.batch.id,
      enrollmentDate: today,
      status: 'active',
    };

    saveLocalStudents([newStudent, ...currentStudents]);

    // 4. Create initial FeeRecord with due date 30 days from enrollment
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 30);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const newFee: FeeRecord = {
      id: 'f_' + Date.now(),
      studentId: newStudent.id,
      studentName: newStudent.name,
      courseName: params.course.name,
      totalAmount: params.course.totalFee,
      paidAmount: 0,
      balanceAmount: params.course.totalFee,
      dueDate,
      paymentStatus: 'pending',
    };

    const currentFees = getLocalFees();
    saveLocalFees([newFee, ...currentFees]);

    // 5. Update lead status to 'converted' & log activity
    try {
      await leadService.updateStatus(params.leadId, 'converted');
      await leadService.addActivity({
        entityType: 'lead',
        entityId: params.leadId,
        activityType: 'status_change',
        summary: `Enrolled as Student ${studentIdNumber} into ${params.batch.name} (${params.course.name})`,
        performedBy: 'Sarah Jenkins',
      });
    } catch (err) {
      console.warn('Could not update lead status on enrollment:', err);
    }

    return { student: newStudent, fee: newFee };
  },

  async getTransactions(): Promise<PaymentTransaction[]> {
    return getLocalTransactions();
  },

  async recordPayment(params: {
    feeRecordId: string;
    amount: number;
    paymentMethod: PaymentTransaction['paymentMethod'];
    referenceNote?: string;
  }): Promise<{ fee: FeeRecord; transaction: PaymentTransaction }> {
    const fees = getLocalFees();
    const idx = fees.findIndex((f) => f.id === params.feeRecordId);
    if (idx === -1) throw new Error('Fee record not found');

    const targetFee = fees[idx];
    if (params.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }
    if (params.amount > targetFee.balanceAmount) {
      throw new Error(`Payment amount ($${params.amount}) cannot exceed remaining balance ($${targetFee.balanceAmount})`);
    }

    const today = new Date().toISOString().split('T')[0];
    const newPaidAmount = targetFee.paidAmount + params.amount;
    const newBalanceAmount = targetFee.totalAmount - newPaidAmount;
    const newStatus: FeeRecord['paymentStatus'] = newBalanceAmount === 0 ? 'paid' : 'partially_paid';

    const updatedFee: FeeRecord = {
      ...targetFee,
      paidAmount: newPaidAmount,
      balanceAmount: newBalanceAmount,
      paymentStatus: newStatus,
      lastPaymentDate: today,
    };

    fees[idx] = updatedFee;
    saveLocalFees(fees);

    // Create PaymentTransaction
    const receiptSeq = 1000 + Math.floor(Math.random() * 9000);
    const newTx: PaymentTransaction = {
      id: 'tx_' + Date.now(),
      feeRecordId: targetFee.id,
      studentId: targetFee.studentId,
      studentName: targetFee.studentName,
      courseName: targetFee.courseName,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      referenceNote: params.referenceNote,
      receiptNumber: `RCP-2026-${receiptSeq}`,
      paymentDate: today,
    };

    const txs = getLocalTransactions();
    saveLocalTransactions([newTx, ...txs]);

    return { fee: updatedFee, transaction: newTx };
  },
};

