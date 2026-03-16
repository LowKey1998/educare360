
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
  TrendingUp
} from 'lucide-react';
import { useDatabase, useRTDBCollection } from '@/firebase';
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

export default function PupilManagementPage() {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsAddSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: students, loading } = useRTDBCollection(database, 'students');

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(s => {
      const matchesSearch = s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
                           s.admissionNo?.toLowerCase().includes(search.toLowerCase());
      const matchesGrade = gradeFilter === 'All Grades' || s.grade === gradeFilter;
      return matchesSearch && matchesGrade;
    });
  }, [students, search, gradeFilter]);

  const stats = useMemo(() => {
    if (!students || students.length === 0) return { total: 0, active: 0, trend: '0.0', avgAttendance: '0.0' };
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const newCount = students.filter(s => (s.createdAt || 0) > thirtyDaysAgo).length;
    const trend = `+${((newCount / students.length) * 100).toFixed(1)}%`;
    
    const avgAttendance = students.reduce((acc, s) => acc + (parseFloat(s.attendanceRate) || 0), 0) / students.length;
    
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
      studentName: formData.get('name'),
      admissionNo: formData.get('admNo'),
      grade: formData.get('grade'),
      gender: formData.get('gender'),
      parentEmail: formData.get('parentEmail'),
      status: 'Active',
      feeBalance: 0,
      attendanceRate: 100,
      createdAt: serverTimestamp()
    };

    try {
      await push(ref(database, 'students'), data);
      setIsAddOpen(false);
      toast({ title: "Pupil Enrolled" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsAddSubmitting(false);
    }
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
            <p className="text-sm text-white/80 mt-1">Manage institutional student records and academic status</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatSummaryCard label="Total Pupils" value={loading ? '...' : stats.total.toString()} trend={stats.trend} icon={<Users className="h-4 w-4" />} color="bg-blue-50 text-blue-600" />
        <StatSummaryCard label="Active" value={loading ? '...' : stats.active.toString()} icon={<UserCheck className="h-4 w-4" />} color="bg-emerald-50 text-emerald-600" />
        <StatSummaryCard label="Arrears" value="Check Finance" icon={<TriangleAlert className="h-4 w-4" />} color="bg-amber-50 text-amber-600" />
        <StatSummaryCard label="Avg Attendance" value={`${stats.avgAttendance}%`} icon={<ArrowUpRight className="h-4 w-4" />} color="bg-purple-50 text-purple-600" />
        <StatSummaryCard label="Registry Status" value="Online" icon={<Database className="h-4 w-4" />} color="bg-teal-50 text-teal-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input className="flex-1 h-10 text-xs" placeholder="Search pupils..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="flex gap-2">
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[160px] h-10 text-xs"><SelectValue placeholder="Grade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Grades">All Grades</SelectItem>
                {['Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700 h-10 text-xs font-bold gap-1.5 px-4"><Plus className="h-3.5 w-3.5" /> Enroll Pupil</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddPupil}>
                  <DialogHeader><DialogTitle>New Enrollment</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input name="name" placeholder="Full Name" required />
                    <Input name="admNo" placeholder="Admission No" required />
                    <Input name="parentEmail" placeholder="Parent Email" required />
                  </div>
                  <DialogFooter><Button type="submit" disabled={isSubmitting}>Confirm</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b text-left">
              <tr>
                <th className="px-4 py-3">Pupil</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3 text-right">Fee Balance</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" /></td></tr>
              ) : filteredStudents.map((student: any) => (
                <tr key={student.id} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3 font-bold">{student.studentName}</td>
                  <td className="px-4 py-3">{student.grade}</td>
                  <td className="px-4 py-3 text-right font-mono">${(student.feeBalance || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => remove(ref(database, `students/${student.id}`))} className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatSummaryCard({ label, value, trend, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</span>
        {trend && <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> {trend}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
