
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
import { ref, update, serverTimestamp } from 'firebase/database';
import { useDatabase, useRTDBCollection } from '@/firebase';

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
  const database = useDatabase();

  const { data: attendanceData, loading } = useRTDBCollection(database, 'attendance');

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
    if (!database) return;
    const nextIndex = (STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length;
    const nextStatus = STATUS_CYCLE[nextIndex];
    
    const dbRef = ref(database, `attendance/${id}`);
    update(dbRef, { 
      status: nextStatus, 
      lastUpdated: serverTimestamp() 
    }).catch(err => console.error("Update failed:", err));
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
                <Database className="h-2.5 w-2.5" /> Realtime Sync
              </span>
            </h2>
            <p className="text-xs text-gray-500">Daily register powered by Firebase Realtime Database</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" /> Submit Attendance
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatSummaryCard label="Present" value={stats.present} percent={stats.presentPct || '0.0'} color="bg-green-50 text-green-600" icon={<CircleCheck className="h-4 w-4" />} />
          <StatSummaryCard label="Absent" value={stats.absent} percent={stats.absentPct || '0.0'} color="bg-red-50 text-red-600" icon={<CircleX className="h-4 w-4" />} />
          <StatSummaryCard label="Late" value={stats.late} percent={stats.latePct || '0.0'} color="bg-amber-50 text-amber-600" icon={<Clock className="h-4 w-4" />} />
          <StatSummaryCard label="Excused" value={stats.excused} percent={stats.excusedPct || '0.0'} color="bg-blue-50 text-blue-600" icon={<TriangleAlert className="h-4 w-4" />} />
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search pupils..." 
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 bg-white" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
                    <p className="text-xs text-gray-400 italic">Syncing with RTDB...</p>
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
                        <p className="text-[10px] text-gray-400 truncate">{item.grade}</p>
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
                    No records found.
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
