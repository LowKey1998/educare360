
"use client"

import { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TriangleAlert, 
  GraduationCap, 
  Search, 
  RefreshCw, 
  Download, 
  Upload, 
  Plus, 
  Database, 
  Zap, 
  ArrowUpDown, 
  Eye, 
  SquarePen, 
  Trash2,
  Server,
  ChevronDown
} from 'lucide-react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';

export default function PupilManagementPage() {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const firestore = useFirestore();

  const studentsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'students'), orderBy('studentName', 'asc'));
  }, [firestore]);

  const { data: students, loading } = useCollection(studentsQuery);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(s => {
      const matchesSearch = 
        s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        s.admissionNo?.toLowerCase().includes(search.toLowerCase()) ||
        s.guardianName?.toLowerCase().includes(search.toLowerCase());
      
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

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Pupil Information Management</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-green-50 text-green-600">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              Synced to database
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-semibold rounded-full">
              <Server className="h-2.5 w-2.5" /> Server Query
            </span>
          </div>
          <p className="text-xs text-gray-500">Manage all {stats.total} enrolled pupils across ECD and Primary</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50" title="Refresh data">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <div className="relative">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-gray-600 bg-white border border-gray-200 hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Pupil
          </button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <SummaryCard 
          label="Total Enrolled" 
          value={loading ? '...' : stats.total.toString()} 
          subText={loading ? 'Loading...' : 'Total pupils'} 
          icon={<Users className="h-4.5 w-4.5" />} 
          gradient="from-teal-500 to-teal-600" 
        />
        <SummaryCard 
          label="Active" 
          value={loading ? '...' : stats.active.toString()} 
          subText={loading ? 'Loading...' : 'Currently active'} 
          icon={<UserCheck className="h-4.5 w-4.5" />} 
          gradient="from-green-500 to-green-600" 
        />
        <SummaryCard 
          label="Suspended" 
          value={loading ? '...' : stats.suspended.toString()} 
          subText="Requires attention" 
          icon={<UserX className="h-4.5 w-4.5" />} 
          gradient="from-red-500 to-red-600" 
        />
        <SummaryCard 
          label="Fee Arrears" 
          value={loading ? '...' : stats.arrears.toString()} 
          subText="Outstanding fees" 
          icon={<TriangleAlert className="h-4.5 w-4.5" />} 
          gradient="from-amber-500 to-amber-600" 
        />
        <SummaryCard 
          label="Avg Attendance" 
          value={loading ? '...' : `${stats.avgAttendance.toFixed(1)}%`} 
          subText={loading ? 'Loading...' : 'School-wide average'} 
          icon={<GraduationCap className="h-4.5 w-4.5" />} 
          gradient="from-blue-500 to-blue-600" 
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, admission number, guardian, or phone..." 
              className="w-full pl-9 pr-10 py-2 text-xs border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-teal-500 outline-none bg-white"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option>All Grades</option>
            {['Baby Class', 'Middle Class', 'Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'].map(g => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <select 
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-teal-500 outline-none bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            {['Active', 'Suspended', 'Transferred', 'Graduated', 'Withdrawn'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-teal-500 outline-none bg-white">
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
          <div className="flex items-center gap-1">
            <Database className="h-2.5 w-2.5" />
            <span>Showing {filteredStudents.length} of {students?.length || 0} filtered records</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1">
            <Zap className="h-2.5 w-2.5 text-indigo-400" />
            <span className="text-indigo-400">Server-side query with .ilike(), .eq(), .range() operators</span>
          </div>
        </div>
      </div>

      {/* Pupils Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" class="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                </th>
                <th className="px-4 py-3 text-left">
                  <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
                    Adm No <ArrowUpDown className="h-2.5 w-2.5" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
                    Pupil Name <ArrowUpDown className="h-2.5 w-2.5 text-teal-600" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
                    Grade <ArrowUpDown className="h-2.5 w-2.5" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Guardian</th>
                <th className="px-4 py-3 text-left">
                  <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
                    Attendance <ArrowUpDown className="h-2.5 w-2.5" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
                    Fee Balance <ArrowUpDown className="h-2.5 w-2.5" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
              {filteredStudents.length > 0 ? filteredStudents.map((student: any) => (
                <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{student.admissionNo || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0 ${student.gender === 'Female' ? 'bg-pink-500' : 'bg-blue-500'}`}>
                        {getInitials(student.studentName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{student.studentName}</p>
                        <p className="text-[10px] text-gray-400">Age: {student.age || 'N/A'} | DOB: {student.dob || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{student.grade || 'N/A'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{student.gender || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-600 truncate max-w-[140px]">{student.guardianName || 'N/A'}</p>
                    <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{student.guardianPhone || 'N/A'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${student.attendanceRate > 90 ? 'bg-green-500' : 'bg-amber-500'}`} 
                          style={{ width: `${student.attendanceRate || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{(student.attendanceRate || 0).toFixed(2)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${student.feeBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${(student.feeBalance || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      student.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      student.status === 'Suspended' ? 'bg-red-100 text-red-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {student.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-colors" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                        <SquarePen className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-400 text-sm italic">
                    {loading ? 'Fetching pupil records...' : 'No pupils found matching your criteria.'}
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
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{subText}</p>
    </div>
  );
}
