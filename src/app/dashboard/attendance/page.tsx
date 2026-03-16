
"use client"

import { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  CircleX, 
  Clock, 
  TriangleAlert, 
  Database, 
  Search, 
  CircleCheck,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useDatabase, useRTDBCollection, useUserProfile } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { studentService } from '@/services/students';

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any }> = {
  'present': { label: 'Present', color: 'bg-green-100 text-green-700', icon: CircleCheck },
  'absent': { label: 'Absent', color: 'bg-red-100 text-red-700', icon: CircleX },
  'late': { label: 'Late', color: 'bg-amber-100 text-amber-700', icon: Clock },
  'excused': { label: 'Excused', color: 'bg-blue-100 text-blue-700', icon: TriangleAlert },
};

const STATUS_CYCLE = ['present', 'absent', 'late', 'excused'];

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const database = useDatabase();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const { data: attendanceData, loading } = useRTDBCollection(database, 'attendance');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';

  const filteredData = useMemo(() => {
    if (!attendanceData) return [];
    const baseData = profile?.role === 'parent' 
      ? attendanceData.filter((s: any) => s.parentEmail?.toLowerCase() === profile.email?.toLowerCase())
      : attendanceData;

    return baseData.filter((s: any) => {
      const matchesSearch = s.studentName?.toLowerCase().includes(search.toLowerCase());
      const matchesGrade = gradeFilter === 'All' || s.grade === gradeFilter;
      return matchesSearch && matchesGrade;
    });
  }, [attendanceData, search, gradeFilter, profile]);

  const stats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return { present: 0, absent: 0, late: 0, excused: 0, total: 0, presentTrend: '0.0' };
    const total = filteredData.length;
    const present = filteredData.filter((s: any) => s.status === 'present').length;
    const absent = filteredData.filter((s: any) => s.status === 'absent').length;
    const late = filteredData.filter((s: any) => s.status === 'late').length;
    const excused = filteredData.filter((s: any) => s.status === 'excused').length;
    
    // Trend relative to daily target 95%
    const presentPct = ((present / total) * 100);
    const trend = (presentPct - 95).toFixed(1);
    
    return {
      present,
      absent,
      late,
      excused,
      total,
      presentPct: presentPct.toFixed(1),
      absentPct: ((absent / total) * 100).toFixed(1),
      latePct: ((late / total) * 100).toFixed(1),
      excusedPct: ((excused / total) * 100).toFixed(1),
      presentTrend: trend
    };
  }, [filteredData]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (!isAdmin || !database) return;
    const nextIndex = (STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length;
    const nextStatus = STATUS_CYCLE[nextIndex];
    try {
      await studentService.updateAttendance(database, id, nextStatus);
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-[#1E3A5F] via-[#1E3A5F] to-[#0D9488] rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.role === 'parent' ? 'Family Attendance' : 'Live Register'}</h2>
            <p className="text-sm text-white/80 mt-1">Real-time presence tracking powered by institutional data nodes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatSummaryCard label="Present" value={stats.present} percent={stats.presentPct} trend={stats.presentTrend} color="bg-green-50 text-green-600" icon={<CircleCheck className="h-4 w-4" />} />
        <StatSummaryCard label="Absent" value={stats.absent} percent={stats.absentPct} color="bg-red-50 text-red-600" icon={<CircleX className="h-4 w-4" />} />
        <StatSummaryCard label="Late" value={stats.late} percent={stats.latePct} color="bg-amber-50 text-amber-600" icon={<Clock className="h-4 w-4" />} />
        <StatSummaryCard label="Excused" value={stats.excused} percent={stats.excusedPct} color="bg-blue-50 text-blue-600" icon={<TriangleAlert className="h-4 w-4" />} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search pupils..." 
                  className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-teal-500" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {isAdmin && (
                <select 
                  className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white font-bold text-gray-600"
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                >
                  <option value="All">All Grades</option>
                  {['Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              )}
            </div>

            <div className="space-y-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-teal-600 mb-2" />
                  <p className="text-xs text-gray-400 italic">Syncing...</p>
                </div>
              ) : filteredData.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {filteredData.map((item: any, idx: number) => {
                    const status = item.status || 'absent';
                    const config = STATUS_CONFIG[status] || STATUS_CONFIG['absent'];
                    const StatusIcon = config.icon;
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all group">
                        <span className="text-[10px] text-gray-400 w-6 font-bold">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{item.studentName}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">{item.grade}</p>
                        </div>
                        {isAdmin ? (
                          <button 
                            onClick={() => toggleStatus(item.id, status)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold transition-all shadow-sm ${config.color} hover:scale-105`}
                          >
                            <StatusIcon className="h-3 w-3" /> {config.label}
                          </button>
                        ) : (
                          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold ${config.color}`}>
                            <StatusIcon className="h-3 w-3" /> {config.label}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <p className="text-sm text-gray-400">No records found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatSummaryCard({ label, value, percent, trend, color, icon }: any) {
  const isPositive = parseFloat(trend || '0') >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shadow-sm`}>{icon}</div>
        {trend && (
          <span className={`text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{label} ({percent}%)</p>
    </div>
  );
}
