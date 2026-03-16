
"use client"

import { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TriangleAlert, 
  GraduationCap, 
  Search, 
  Download, 
  Plus, 
  Eye, 
  SquarePen, 
  Trash2,
  Loader2,
  Database,
  ArrowUpRight,
  Filter
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
      const matchesSearch = 
        s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        s.admissionNo?.toLowerCase().includes(search.toLowerCase()) ||
        s.guardianName?.toLowerCase().includes(search.toLowerCase());
      
      const matchesGrade = gradeFilter === 'All Grades' || s.grade === gradeFilter;
      return matchesSearch && matchesGrade;
    });
  }, [students, search, gradeFilter]);

  const stats = useMemo(() => {
    if (!students || students.length === 0) return { total: 0, active: 0, suspended: 0, arrears: 0, avgAttendance: 0 };
    const total = students.length;
    const active = students.filter(s => s.status === 'Active').length;
    const suspended = students.filter(s => s.status === 'Suspended').length;
    const arrearsCount = students.filter(s => (parseFloat(s.feeBalance) || 0) > 0).length;
    const avgAttendance = students.reduce((acc, s) => acc + (parseFloat(s.attendanceRate) || 0), 0) / total;
    
    return { total, active, suspended, arrearsCount, avgAttendance: avgAttendance.toFixed(1) };
  }, [students]);

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this pupil record?')) return;
    try {
      await remove(ref(database, `students/${id}`));
      toast({ title: "Pupil removed", description: "Record deleted successfully." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete record.", variant: "destructive" });
    }
  };

  const handleAddPupil = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      studentName: formData.get('name'),
      admissionNo: formData.get('admNo'),
      grade: formData.get('grade'),
      gender: formData.get('gender'),
      guardianName: formData.get('guardian'),
      guardianPhone: formData.get('phone'),
      parentEmail: formData.get('parentEmail'),
      status: 'Active',
      feeBalance: 0,
      attendanceRate: 100,
      createdAt: serverTimestamp()
    };

    try {
      await push(ref(database, 'students'), data);
      setIsAddOpen(false);
      toast({ title: "Pupil Enrolled", description: `${data.studentName} added to ${data.grade}.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to enroll pupil.", variant: "destructive" });
    } finally {
      setIsAddSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* High-Fidelity Header */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="30" r="80" fill="white" />
            <circle cx="100" cy="180" r="120" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Pupil Information Management</h2>
            <p className="text-sm text-white/80 mt-1">Manage institutional student records, parents and academic status</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3.5 h-3.5" /> Registry Live
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatSummaryCard label="Total Pupils" value={loading ? '...' : stats.total.toString()} icon={<Users className="h-4 w-4" />} color="bg-blue-50 text-blue-600" />
        <StatSummaryCard label="Active Status" value={loading ? '...' : stats.active.toString()} icon={<UserCheck className="h-4 w-4" />} color="bg-emerald-50 text-emerald-600" />
        <StatSummaryCard label="Fee Arrears" value={loading ? '...' : stats.arrearsCount.toString()} icon={<TriangleAlert className="h-4 w-4" />} color="bg-amber-50 text-amber-600" />
        <StatSummaryCard label="Avg Attendance" value={`${stats.avgAttendance}%`} icon={<ArrowUpRight className="h-4 w-4" />} color="bg-purple-50 text-purple-600" />
        <StatSummaryCard label="Suspended" value={loading ? '...' : stats.suspended.toString()} icon={<UserX className="h-4 w-4" />} color="bg-rose-50 text-rose-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input 
              className="pl-9 text-xs h-10" 
              placeholder="Search pupils by name, admission no, or guardian..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[160px] h-10 text-xs">
                <Filter className="h-3 w-3 mr-2 text-gray-400" />
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Grades">All Grades</SelectItem>
                {['Baby Class', 'Middle Class', 'Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'].map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700 h-10 text-xs font-bold gap-1.5 px-4">
                  <Plus className="h-3.5 w-3.5" /> Enroll Pupil
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <form onSubmit={handleAddPupil}>
                  <DialogHeader>
                    <DialogTitle>New Pupil Enrollment</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input name="name" placeholder="Tendai Moyo" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Admission No</Label>
                        <Input name="admNo" placeholder="SA-2026-001" required />
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
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Grade/Class</Label>
                        <Select name="grade" defaultValue="Grade 1">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Baby Class', 'Middle Class', 'Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'].map(g => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Guardian Name</Label>
                        <Input name="guardian" placeholder="James Moyo" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Guardian Phone</Label>
                        <Input name="phone" placeholder="+263 7..." required />
                      </div>
                      <div className="space-y-2">
                        <Label>Parent Email (Portal)</Label>
                        <Input name="parentEmail" type="email" placeholder="parent@example.com" required />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-teal-600">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Complete Enrollment
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-50">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Pupil Profile</th>
                <th className="text-left py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Adm No</th>
                <th className="text-left py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Grade</th>
                <th className="text-left py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Guardian & Contact</th>
                <th className="text-right py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Fee Balance</th>
                <th className="text-center py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Syncing Student Data...</p>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? filteredStudents.map((student: any) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${student.gender === 'Female' ? 'bg-rose-500' : 'bg-blue-500'}`}>
                        {getInitials(student.studentName)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{student.studentName}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{student.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500">{student.admissionNo}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-bold uppercase">
                      {student.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-700">{student.guardianName}</p>
                    <p className="text-[10px] text-gray-400">{student.guardianPhone}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className={`font-bold ${parseFloat(student.feeBalance) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ${(parseFloat(student.feeBalance) || 0).toFixed(2)}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-teal-600 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-blue-600 transition-colors"><SquarePen className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(student.id)} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-rose-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 italic text-xs">
                    No pupils found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatSummaryCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group cursor-default">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</span>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
