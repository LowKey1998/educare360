
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
  isCateringSubscribed?: boolean;
  dietaryRequirements?: string;
  lastAcademicUpdate?: any;
  lastBillingTerm?: string;
  lastBillingDate?: any;
  lastRegistryUpdate?: any;
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
  enrolledId?: string;
  enrollmentDate?: any;
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

export interface Subject {
  id: string;
  name: string;
  code: string;
  createdAt?: any;
}

export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  location: string;
  capacity: number;
  status: string;
  createdAt?: any;
}

export interface Lesson {
  id: string;
  grade: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  room: string;
  day: string;
  period: string;
  startTime: string;
  endTime: string;
  createdAt?: any;
}

export interface LessonPlan {
  id: string;
  grade: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  topic: string;
  objectives: string;
  status: 'Draft' | 'Approved' | 'Completed';
  createdAt: any;
}

export interface Exam {
  id: string;
  grade: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  teacherId: string;
  teacherName: string;
  createdAt: any;
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
  currency: string;
  currencySymbol: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  privacyPolicy?: string;
  termsAndConditions?: string;
  lastFeeAmount?: number;
  lastFeeTerm?: string;
  lastFeeGrades?: string[];
  updatedAt?: any;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: any;
  link?: string;
}

export interface PeriodStructure {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  createdAt?: any;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  type: 'report-cards' | 'admission-letters' | 'fee-statements' | 'pupil-id' | 'certificates' | 'custom';
  term?: string;
  grades: string[];
  fields: number;
  format: string;
  status: 'Active' | 'Draft';
  createdAt: any;
}
