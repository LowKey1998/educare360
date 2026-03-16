
export type UserRole = 'admin' | 'staff' | 'parent';

export interface UserProfile {
  id: string;
  uid: string;
  email: string | null;
  role: UserRole;
  displayName?: string;
  department?: string;
  createdAt?: any;
}

export interface Student {
  id: string;
  studentName: string;
  admissionNo: string;
  grade: string;
  gender: 'Male' | 'Female';
  guardianName: string;
  guardianPhone: string;
  parentEmail: string;
  feeBalance: number;
  attendanceRate: number;
  status: string;
  marks?: Record<string, number>;
  lastAcademicUpdate?: any;
  createdAt?: any;
}

export interface Admission {
  id: string;
  studentName: string;
  grade: string;
  age: number;
  status: 'New' | 'Under Review' | 'Interview' | 'Accepted' | 'Waitlisted' | 'Rejected';
  submissionDate: string;
  docsPending: boolean;
  applicationId: string;
  createdAt?: any;
}

export interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: string;
  type: string;
  timestamp: any;
}

export interface School {
  id: string;
  name: string;
  city: string;
  type: 'Main Campus' | 'Branch' | 'Satellite';
  enrollment: number;
  staff: number;
  plan: string;
  status: string;
  revenue?: string;
  createdAt?: any;
}

export interface Classroom {
  id: string;
  name: string;
  teacher: string;
  location: string;
  capacity: number;
  status: string;
  createdAt?: any;
}

export interface Lesson {
  id: string;
  grade: string;
  subject: string;
  teacher: string;
  room: string;
  day: string;
  period: string;
  createdAt?: any;
}

export interface MealPlan {
  id: string;
  title: string;
  status: string;
  dateRange: string;
  schedule: Array<{ day: string; meal: string }>;
  createdAt?: any;
}

export interface HealthRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  condition: string;
  outcome: string;
  nurse: string;
  date: string;
  createdAt?: any;
}

export interface Asset {
  id: string;
  name: string;
  assetTag: string;
  serialNumber: string;
  category: string;
  location: string;
  condition: string;
  value: number;
  cost: number;
  custodian?: string;
  status: string;
  createdAt?: any;
}

export interface Announcement {
  id: string;
  content: string;
  communicationType: string;
  audience: string;
  createdAt: any;
}

export interface SystemSettings {
  schoolName: string;
  shortName: string;
  motto: string;
  currentTerm: string;
  currentYear: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
  primaryColor: string;
  updatedAt?: any;
}
