
"use client"

import { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TriangleAlert, 
  Search, 
  Plus, 
  Eye, 
  SquarePen, 
  Trash2,
  Loader2,
  Database,
  ArrowUpRight,
  Filter,
  TrendingUp,
  Mail,
  ShieldCheck,
  Phone
} from 'lucide-react';
import { useDatabase, useRTDBCollection, useRTDBDoc } from '@/firebase';
import { ref, push, remove, serverTimestamp } from 'firebase/database';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { studentService } from '@/services/students';
import { Student, UserProfile } from '@/lib/types';

const GRADES = ['Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

export default function PupilManagementPage() {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: students, loading: studentsLoading } = useRTDBCollection<Student>(database, 'students');
  const { data: users, loading: usersLoading } = useRTDBCollection<UserProfile>(database, 'users');
  const { data: schoolSettings } = useRTDBDoc(database, 'system_settings');

  const loading = studentsLoading || usersLoading;
  const currencySymbol = schoolSettings?.currencySymbol || '$';

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(s => {
      const matchesSearch = s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
                           s.admissionNo?.toLowerCase().includes(search.toLowerCase()) ||
                           s.parentEmail?.toLowerCase().includes(search.toLowerCase()) ||
                           s.guardianName?.toLowerCase().includes(search.toLowerCase());
      const matchesGrade = gradeFilter === 'All Grades' || s.grade === gradeFilter;
      return matchesSearch && matchesGrade;
    });
  }, [students, search, gradeFilter]);

  const stats = useMemo(() => {
    if (!students || students.length === 0) return { total: 0, active: 0, trend: '0.0', avgAttendance: '0.0' };
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const newCount = students.filter(s => {
      const createdAt = typeof s.createdAt === 'number' ? s.createdAt : 0;
      return createdAt > thirtyDaysAgo;
    }).length;
    const trend = `+${((newCount / students.length) * 100).toFixed(1)}%`;
    
    const avgAttendance = students.reduce((acc, s) => acc + (parseFloat(s.attendanceRate as any) || 0), 0) / students.length;
    
    return { 
      total: students.length, 
      active: students.filter(s => s.status === 'Active').length,
      trend,
      avgAttendance: avgAttendance.toFixed(1)
    };
  }, [students]);

  const handleAddPupil = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      studentName: formData.get('name') as string,
      admissionNo: formData.get('admNo') as string,
      grade: formData.get('grade') as string,
      gender: formData.get('gender') as any,
      guardianName: formData.get('guardianName') as string,
      guardianPhone: formData.get('guardianPhone') as string,
      parentEmail: formData.get('parentEmail')?.toString().toLowerCase().trim() || '',
      status: 'Active',
    };

    try {
      await studentService.enrollPupil(database, data);
      setIsAddOpen(false);
      toast({ title: "Pupil Enrolled", description: `${data.studentName} has been added to the registry.` });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsAddSubmitting(false);
    }
  };

  const isParentRegistered = (email: string) => {
    return (users || []).some(u => u.email?.toLowerCase() === email?.toLowerCase() && u.role === 'parent');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Pupil Information Management</h2>
            <p className="text-sm text-white/80 mt-1">Manage institutional student records, guardian links, and academic status</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3.5 h-3.5" /> Registry Live
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatSummaryCard label="Total Pupils" value={loading ? '...' : stats.total.toString()} trend={stats.trend} icon={<Users className="h-4 w-4" />} color="bg-blue-50 text-blue-600" />
        <StatSummaryCard label="Active" value={loading ? '...' : stats.active.toString()} icon={<UserCheck className="h-4 w-4" />} color="bg-emerald-50 text-emerald-600" />
        <StatSummaryCard label="Portal Adoption" value={loading ? '...' : `${students.length > 0 ? (students.filter(s => isParentRegistered(s.parentEmail)).length / students.length * 100).toFixed(0) : 0}%`} icon={<ShieldCheck className="h-4 w-4" />} color="bg-indigo-50 text-indigo-600" />
        <StatSummaryCard label="Avg Attendance" value={`${stats.avgAttendance}%`} icon={<TrendingUp className="h-4 w-4" />} color="bg-purple-50 text-purple-600" />
        <StatSummaryCard label="Registry Status" value="Online" icon={<Database className="h-4 w-4" />} color="bg-teal-50 text-teal-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input 
              className="pl-9 h-10 text-xs" 
              placeholder="Search by pupil, ID, guardian, or email..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <div className="flex gap-2">
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[160px] h-10 text-xs"><SelectValue placeholder="Grade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Grades">All Grades</SelectItem>
                {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700 h-10 text-xs font-bold gap-1.5 px-4 shadow-sm">
                  <Plus className="h-3.5 w-3.5" /> Enroll Pupil
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <form onSubmit={handleAddPupil}>
                  <DialogHeader><DialogTitle>Manual Student Enrollment</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Pupil Full Name</Label>
                      <Input name="name" placeholder="Full Name" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Admission No</Label>
                        <Input name="admNo" placeholder="e.g. 2026-001" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Grade</Label>
                        <Select name="grade" defaultValue="Grade 1">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select name="gender" defaultValue="Male">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border-t border-gray-100 pt-4 mt-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Guardian Details</p>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Guardian Name</Label>
                            <Input name="guardianName" placeholder="Name" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Guardian Phone</Label>
                            <Input name="guardianPhone" placeholder="+263..." required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Parent Email (for Portal)</Label>
                          <Input name="parentEmail" type="email" placeholder="parent@example.com" required />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isAddSubmitting} className="w-full bg-teal-600">
                      {isAddSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Complete Enrollment
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase tracking-tighter">
              <tr>
                <th className="px-4 py-4">Pupil Identity</th>
                <th className="px-4 py-4">Academic</th>
                <th className="px-4 py-4">Guardian / Parent Contact</th>
                <th className="px-4 py-4 text-right">Fee Balance</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" /></td></tr>
              ) : filteredStudents.length > 0 ? filteredStudents.map((student: Student) => {
                const registered = isParentRegistered(student.parentEmail);
                return (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-inner ${student.gender === 'Female' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                          {student.studentName?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{student.studentName}</p>
                          <p className="text-[9px] text-gray-400 font-mono mt-0.5">{student.admissionNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-bold uppercase">{student.grade}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-gray-700 font-bold flex items-center gap-1.5 truncate max-w-[180px]">
                          {student.guardianName || 'Unspecified'}
                          {registered ? (
                            <ShieldCheck className="h-3 w-3 text-emerald-500" title="Portal Account Active" />
                          ) : (
                            <TriangleAlert className="h-3 w-3 text-amber-400" title="No Portal Account" />
                          )}
                        </p>
                        <div className="flex flex-col gap-0.5 text-[10px] text-gray-400 font-medium">
                          <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {student.parentEmail}</span>
                          <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {student.guardianPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className={`font-mono font-bold ${student.feeBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {currencySymbol}{(student.feeBalance || 0).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-gray-300 hover:text-teal-600 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                        <button onClick={() => studentService.deletePupil(database, student.id)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 italic">No pupil records found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatSummaryCard({ label, value, trend, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group cursor-default">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</span>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
