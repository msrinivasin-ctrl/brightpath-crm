import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Lead, LeadStatus, ActivityLog } from '../types/crm';
import { mockLeads } from '../data/mockData';

const LOCAL_STORAGE_KEY = 'brightpath_leads';
const LOCAL_STORAGE_ACTIVITIES_KEY = 'brightpath_lead_activities';

// Helper to get local leads
const getLocalLeads = (): Lead[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockLeads));
    return mockLeads;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return mockLeads;
  }
};

const saveLocalLeads = (leads: Lead[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
};

// Helper to get local activities
const getLocalActivities = (): ActivityLog[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_ACTIVITIES_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const saveLocalActivities = (activities: ActivityLog[]) => {
  localStorage.setItem(LOCAL_STORAGE_ACTIVITIES_KEY, JSON.stringify(activities));
};

// Map database row to Lead interface
interface SupabaseLeadRow {
  id: string;
  student_name: string;
  parent_name?: string | null;
  email: string;
  phone: string;
  grade_level?: string | null;
  course_interest: string;
  source: string;
  status: string;
  counselor_assigned: string;
  notes?: string | null;
  follow_up_date?: string | null;
  created_at: string;
  updated_at: string;
}

const mapRowToLead = (row: SupabaseLeadRow): Lead => ({
  id: row.id,
  studentName: row.student_name,
  parentName: row.parent_name || undefined,
  email: row.email,
  phone: row.phone,
  gradeLevel: row.grade_level || undefined,
  courseInterest: row.course_interest,
  source: row.source as Lead['source'],
  status: row.status as LeadStatus,
  counselorAssigned: row.counselor_assigned,
  notes: row.notes || undefined,
  followUpDate: row.follow_up_date || undefined,
  createdAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
  updatedAt: row.updated_at ? row.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
});

export const leadService = {
  // Fetch all leads
  async getLeads(): Promise<{ leads: Lead[]; source: 'supabase' | 'local' }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = (data as SupabaseLeadRow[]).map(mapRowToLead);
          saveLocalLeads(mapped);
          return { leads: mapped, source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using local store:', err);
      }
    }

    return { leads: getLocalLeads(), source: 'local' };
  },

  // Create a new lead
  async createLead(
    leadInput: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Lead> {
    const today = new Date().toISOString().split('T')[0];
    const newId = 'l_' + Date.now();

    const localNewLead: Lead = {
      ...leadInput,
      id: newId,
      createdAt: today,
      updatedAt: today,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .insert([
            {
              student_name: leadInput.studentName,
              parent_name: leadInput.parentName || null,
              email: leadInput.email,
              phone: leadInput.phone,
              grade_level: leadInput.gradeLevel || null,
              course_interest: leadInput.courseInterest,
              source: leadInput.source,
              status: leadInput.status,
              counselor_assigned: leadInput.counselorAssigned,
              notes: leadInput.notes || null,
              follow_up_date: leadInput.followUpDate || null,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          const mapped = mapRowToLead(data as SupabaseLeadRow);
          const current = getLocalLeads();
          saveLocalLeads([mapped, ...current]);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase lead insertion failed, using local store:', err);
      }
    }

    // Fallback to local storage
    const current = getLocalLeads();
    const updated = [localNewLead, ...current];
    saveLocalLeads(updated);
    return localNewLead;
  },

  // Update lead status
  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    const today = new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const mapped = mapRowToLead(data as SupabaseLeadRow);
          const current = getLocalLeads().map((l) => (l.id === id ? mapped : l));
          saveLocalLeads(current);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase status update failed, falling back to local store:', err);
      }
    }

    const current = getLocalLeads();
    const index = current.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Lead not found');

    const updatedLead: Lead = {
      ...current[index],
      status,
      updatedAt: today,
    };

    current[index] = updatedLead;
    saveLocalLeads(current);
    return updatedLead;
  },

  // Update lead details
  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const today = new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };
        if (updates.studentName) payload.student_name = updates.studentName;
        if (updates.parentName !== undefined) payload.parent_name = updates.parentName;
        if (updates.email) payload.email = updates.email;
        if (updates.phone) payload.phone = updates.phone;
        if (updates.gradeLevel !== undefined) payload.grade_level = updates.gradeLevel;
        if (updates.courseInterest) payload.course_interest = updates.courseInterest;
        if (updates.source) payload.source = updates.source;
        if (updates.status) payload.status = updates.status;
        if (updates.counselorAssigned) payload.counselor_assigned = updates.counselorAssigned;
        if (updates.notes !== undefined) payload.notes = updates.notes;
        if (updates.followUpDate !== undefined) payload.follow_up_date = updates.followUpDate;

        const { data, error } = await supabase
          .from('leads')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const mapped = mapRowToLead(data as SupabaseLeadRow);
          const current = getLocalLeads().map((l) => (l.id === id ? mapped : l));
          saveLocalLeads(current);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase lead update failed, using local store:', err);
      }
    }

    const current = getLocalLeads();
    const index = current.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Lead not found');

    const updatedLead: Lead = {
      ...current[index],
      ...updates,
      updatedAt: today,
    };

    current[index] = updatedLead;
    saveLocalLeads(current);
    return updatedLead;
  },

  // Activities
  async getActivities(leadId: string): Promise<ActivityLog[]> {
    const all = getLocalActivities();
    return all.filter((a) => a.entityId === leadId);
  },

  async addActivity(
    activityInput: Omit<ActivityLog, 'id' | 'timestamp'>
  ): Promise<ActivityLog> {
    const newActivity: ActivityLog = {
      ...activityInput,
      id: 'act_' + Date.now(),
      timestamp: new Date().toISOString(),
    };

    const all = getLocalActivities();
    saveLocalActivities([newActivity, ...all]);
    return newActivity;
  },
};
