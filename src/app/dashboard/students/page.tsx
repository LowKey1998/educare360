
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
  Loader2
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
  const [statusFilter, setStatusFilter] = useState('All Status');
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
        s.guardianName?.toLowerCase().includes(search.toLowerCase()) ||
        s.parentEmail?.toLowerCase().includes(search.toLowerCase());
      
      const matchesGrade = gradeFilter === 'All Grades' || s.grade?.includes(gradeFilter);
      const matchesStatus = statusFilter === 'All Status' || s.status === statusFilter;

      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [students, search, gradeFilter, statusFilter]);

  const stats = useMemo(() => {
    if (!students) return { total: 0, active: 0, suspended: 0, arrears: 0, avgAttendance: 0 };
    const total = students.length;
    const active = students.filter(s => s.status === 'Active').length;
    const suspended = students.filter(s => s.status === 'Suspended').length;
    const arrears = students.filter(s => (s.feeBalance || 0) > 0).length;
    const avgAttendance = students.length > 0 
      ? students.reduce((acc, s) => acc + (s.attendanceRate || 0), 0) / students.length 
      : 0;
    
    return { total, active, suspended, arrears, avgAttendance };
  }, [students]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this pupil?')) return;
    try {
      await remove(ref(database, `students/${id}`));
      toast({ title: "Pupil removed", description: "The record has been successfully deleted." });
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
      toast({ title: "Pupil Added", description: `${data.studentName} has been enrolled.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to add pupil.", variant: "destructive" });
    } finally {
      setIsAddSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Pupil Information Management</h2>
          <p className="text-xs text-gray-500">Manage all {stats.total} enrolled pupils across ECD and Primary</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => toast({ title: "Export Started", description: "Generating student CSV..." })}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 bg-teal-600 hover:bg-teal-700 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Pupil
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddPupil}>
                <DialogHeader>
                  <DialogTitle>New Pupil Enrollment</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="Tendai Moyo" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admNo">Admission No</Label>
                      <Input id="admNo" name="admNo" placeholder="SA-2024-001" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select name="gender" defaultValue="Male">
                        <SelectTrigger>
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade/Class</Label>
                      <Select name="grade" defaultValue="Grade 1">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['Baby Class', 'Middle Class', 'Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'].map(g => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentEmail">Parent Email (for login)</Label>
                      <Input id="parentEmail" name="parentEmail" type="email" placeholder="james@example.com" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guardian">Guardian Name</Label>
                      <Input id="guardian" name="guardian" placeholder="James Moyo" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Guardian Phone</Label>
                      <Input id="phone" name="phone" placeholder="+263 7..." required />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Enrolling..." : "Enroll Student"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <SummaryCard label="Total Enrolled" value={loading ? '...' : stats.total.toString()} subText="Total pupils" icon={<Users className="h-4.5 w-4.5" />} gradient="from-teal-500 to-teal-600" />
        <SummaryCard label="Active" value={loading ? '...' : stats.active.toString()} subText="Currently active" icon={<UserCheck className="h-4.5 w-4.5" />} gradient="from-green-500 to-green-600" />
        <SummaryCard label="Suspended" value={loading ? '...' : stats.suspended.toString()} subText="Requires attention" icon={<UserX className="h-4.5 w-4.5" />} gradient="from-red-500 to-red-600" />
        <SummaryCard label="Fee Arrears" value={loading ? '...' : `$${stats.arrears}`} subText="Count: 12" icon={<TriangleAlert className="h-4.5 w-4.5" />} gradient="from-amber-500 to-amber-600" />
        <SummaryCard label="Avg Attendance" value={loading ? '...' : `${stats.avgAttendance.toFixed(1)}%`} subText="School average" icon={<GraduationCap className="h-4.5 w-4.5" />} gradient="from-blue-500 to-blue-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, ID, or guardian..." 
              className="w-full pl-9 pr-10 py-2 text-xs border border-gray-200 rounded-lg focus:border-teal-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white" value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
            <option>All Grades</option>
            {['Baby Class', 'Middle Class', 'Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'].map(g => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Adm No</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pupil Name</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Guardian</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Fee Balance</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
              {filteredStudents.length > 0 ? filteredStudents.map((student: any) => (
                <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{student.admissionNo || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0 ${student.gender === 'Female' ? 'bg-pink-500' : 'bg-blue-500'}`}>
                        {getInitials(student.studentName)}
                      </div>
                      <p className="text-xs font-medium text-gray-800 truncate">{student.studentName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{student.grade || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-700">{student.guardianName}</p>
                    <p className="text-[10px] text-gray-400">{student.parentEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${student.feeBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${(student.feeBalance || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-colors" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm italic">
                    {loading ? 'Syncing...' : 'No pupils found.'}
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

function SummaryCard({ label, value, subText, icon, gradient }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-medium text-gray-500">{label}</p>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm`}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{subText}</p>
    </div>
  );
}
