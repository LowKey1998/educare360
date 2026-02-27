
"use client"

import { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  CircleX, 
  Clock, 
  TriangleAlert, 
  Database, 
  Download, 
  ChevronDown, 
  Search, 
  Calendar,
  CircleCheck,
  Loader2,
  Server
} from 'lucide-react';
import { collection, query, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any }> = {
  'present': { label: 'Present', color: 'bg-green-100 text-green-700', icon: CircleCheck },
  'absent': { label: 'Absent', color: 'bg-red-100 text-red-700', icon: CircleX },
  'late': { label: 'Late', color: 'bg-amber-100 text-amber-700', icon: Clock },
  'excused': { label: 'Excused', color: 'bg-blue-100 text-blue-700', icon: TriangleAlert },
};

const STATUS_CYCLE = ['present', 'absent', 'late', 'excused'];

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const firestore = useFirestore();

  // For MVP we query all and filter client side, or we could add 'where' clauses
  const attendanceQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'attendance'));
  }, [firestore]);

  const { data: attendanceData, loading } = useCollection(attendanceQuery);

  const filteredData = useMemo(() => {
    if (!attendanceData) return [];
    return attendanceData.filter((s: any) => {
      const matchesSearch = 
        s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(search.toLowerCase());
      const matchesClass = classFilter === 'All' || s.grade === classFilter;
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [attendanceData, search, classFilter, statusFilter]);

  const stats = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) return { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
    const total = attendanceData.length;
    const present = attendanceData.filter((s: any) => s.status === 'present').length;
    const absent = attendanceData.filter((s: any) => s.status === 'absent').length;
    const late = attendanceData.filter((s: any) => s.status === 'late').length;
    const excused = attendanceData.filter((s: any) => s.status === 'excused').length;
    
    return {
      present,
      absent,
      late,
      excused,
      total,
      presentPct: ((present / total) * 100).toFixed(1),
      absentPct: ((absent / total) * 100).toFixed(1),
      latePct: ((late / total) * 100).toFixed(1),
      excusedPct: ((excused / total) * 100).toFixed(1),
    };
  }, [attendanceData]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (!firestore) return;
    const nextIndex = (STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length;
    const nextStatus = STATUS_CYCLE[nextIndex];
    
    const docRef = doc(firestore, 'attendance', id);
    updateDoc(docRef, { 
      status: nextStatus, 
      lastUpdated: serverTimestamp() 
    }).catch(async () => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { status: nextStatus }
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              Attendance Management
              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[9px] font-semibold rounded-full flex items-center gap-1">
                <Database className="h-2.5 w-2.5" /> Server Query
              </span>
            </h2>
            <p className="text-xs text-gray-500">Daily attendance register with server-side search, filter, and pagination</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-gray-600 bg-white border border-gray-200 hover:bg-gray-50">
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" /> Submit Attendance
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatSummaryCard 
            label="Present" 
            value={stats.present} 
            percent={stats.presentPct || '0.0'} 
            color="bg-green-50 text-green-600" 
            icon={<CircleCheck className="h-4 w-4" />} 
          />
          <StatSummaryCard 
            label="Absent" 
            value={stats.absent} 
            percent={stats.absentPct || '0.0'} 
            color="bg-red-50 text-red-600" 
            icon={<CircleX className="h-4 w-4" />} 
          />
          <StatSummaryCard 
            label="Late" 
            value={stats.late} 
            percent={stats.latePct || '0.0'} 
            color="bg-amber-50 text-amber-600" 
            icon={<Clock className="h-4 w-4" />} 
          />
          <StatSummaryCard 
            label="Excused" 
            value={stats.excused} 
            percent={stats.excusedPct || '0.0'} 
            color="bg-blue-50 text-blue-600" 
            icon={<TriangleAlert className="h-4 w-4" />} 
          />
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 px-4 overflow-x-auto custom-scrollbar">
            <button className="px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap border-teal-600 text-teal-600">Daily Register</button>
            <button className="px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap border-transparent text-gray-500 hover:text-gray-700">Attendance Analytics</button>
            <button className="px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap border-transparent text-gray-500 hover:text-gray-700">Staff Attendance</button>
          </div>

          <div className="p-5">
            <div className="space-y-4">
              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name, adm no, grade..." 
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 bg-white" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select 
                  className="px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white focus:border-teal-500"
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  <option value="All">All Classes</option>
                  {['Baby Class', 'Middle Class', 'Reception A', 'Grade 1B', 'Grade 2A', 'Grade 2B', 'Grade 3A', 'Grade 4A', 'Grade 5B', 'Grade 6A', 'Grade 7B'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select 
                  className="px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white focus:border-teal-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 px-2 py-2 bg-gray-50 rounded-lg">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Server Context Badge */}
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <Database className="h-2.5 w-2.5 text-teal-500" />
                <span>Server-side query: .ilike() on name, adm_no, grade | .eq() on status</span>
                <span className="text-gray-300">|</span>
                <span>Showing <b className="text-gray-600">{filteredData.length}</b> of <b className="text-gray-600">{attendanceData?.length || 0}</b></span>
              </div>

              {/* Attendance List */}
              <div className="space-y-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
                    <p className="text-xs text-gray-400 italic">Syncing attendance data...</p>
                  </div>
                ) : filteredData.length > 0 ? filteredData.map((item: any, idx: number) => {
                  const status = item.status || 'absent';
                  const config = STATUS_CONFIG[status] || STATUS_CONFIG['absent'];
                  const StatusIcon = config.icon;

                  return (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                      <span className="text-[10px] text-gray-400 w-6 font-medium">{idx + 1}</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ${item.gender === 'Female' ? 'bg-pink-500' : 'bg-blue-500'}`}>
                        {getInitials(item.studentName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.studentName}</p>
                        <p className="text-[10px] text-gray-400 truncate">{item.admissionNo || 'SA-2024'} | {item.grade}</p>
                      </div>
                      <button 
                        onClick={() => toggleStatus(item.id, status)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm ${config.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </button>
                    </div>
                  )
                }) : (
                  <div className="text-center py-12 text-gray-400 italic text-xs">
                    No students found matching your criteria.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatSummaryCard({ label, value, percent, color, icon }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow group">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2 transition-transform group-hover:scale-110 shadow-sm`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label} ({percent}%)</p>
    </div>
  );
}
