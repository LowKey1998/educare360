
"use client"

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Baby, 
  GraduationCap, 
  DollarSign, 
  ClipboardCheck, 
  Briefcase,
  TrendingUp,
  TrendingDown,
  UserPlus,
  MessageSquare,
  FileText,
  Calendar,
  CircleCheck,
  Clock,
  TriangleAlert,
  CircleX,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell
} from 'recharts';
import { useDatabase, useRTDBCollection, useUserProfile } from '@/firebase';

export default function DashboardPage() {
  const database = useDatabase();
  const { profile } = useUserProfile();
  
  // Real-time data streams
  const { data: students, loading: studentsLoading } = useRTDBCollection(database, 'students');
  const { data: admissions, loading: admissionsLoading } = useRTDBCollection(database, 'admissions');
  const { data: attendance, loading: attendanceLoading } = useRTDBCollection(database, 'attendance');
  const { data: users, loading: usersLoading } = useRTDBCollection(database, 'users');

  const loading = studentsLoading || admissionsLoading || attendanceLoading || usersLoading;

  // Memoized Metrics
  const stats = useMemo(() => {
    const totalEnrolment = students.length;
    const ecdPupils = students.filter(s => 
      ['Baby Class', 'Middle Class', 'Reception', 'ECD A', 'ECD B'].some(g => s.grade?.includes(g))
    ).length;
    const primaryPupils = totalEnrolment - ecdPupils;
    
    const staffCount = users.filter(u => u.role === 'admin' || u.role === 'staff').length;
    
    const totalAttendanceRate = students.length > 0 
      ? students.reduce((acc, s) => acc + (s.attendanceRate || 0), 0) / students.length 
      : 0;

    const totalRevenue = students.reduce((acc, s) => acc + (s.feeBalance || 0), 0); // Note: In real app this would be from a ledger, here we use balance as a proxy

    return {
      totalEnrolment,
      ecdPupils,
      primaryPupils,
      staffCount,
      attendanceRate: totalAttendanceRate.toFixed(1),
      revenue: totalRevenue.toLocaleString(),
      newApps: admissions.filter(a => a.status === 'New').length
    };
  }, [students, admissions, users]);

  // Distribution Data for Chart
  const distributionData = useMemo(() => {
    const grades = ['Baby Class', 'Middle Class', 'Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];
    const colors = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4', '#F59E0B', '#FBBF24'];
    
    return grades.map((grade, idx) => ({
      name: grade,
      value: students.filter(s => s.grade === grade).length,
      color: colors[idx]
    })).filter(d => d.value > 0);
  }, [students]);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">Syncing institutional data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1E3A5F] via-[#1E3A5F] to-[#0D9488] rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="30" r="80" fill="white" opacity="0.1" />
            <circle cx="380" cy="150" r="120" fill="white" opacity="0.05" />
            <circle cx="50" cy="180" r="60" fill="white" opacity="0.08" />
          </svg>
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold font-headline">Good Day, {profile?.displayName || 'User'}</h2>
          <p className="text-sm text-white/70 mt-1">Welcome back to EduCare360. Here's your real-time school overview.</p>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <HeroMetric label="Avg Attendance" value={`${stats.attendanceRate}%`} />
            <HeroMetric label="Arrears Total" value={`$${stats.revenue}`} />
            <HeroMetric label="New Apps" value={stats.newApps.toString()} />
            <HeroMetric label="Total Pupils" value={stats.totalEnrolment.toString()} />
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Enrolment" value={stats.totalEnrolment.toString()} trend="+0%" isPositive={true} icon={<Users className="w-5 h-5" />} color="bg-blue-50 text-blue-600" />
        <StatCard title="ECD Pupils" value={stats.ecdPupils.toString()} trend="+0%" isPositive={true} icon={<Baby className="w-5 h-5" />} color="bg-purple-50 text-purple-600" />
        <StatCard title="Primary Pupils" value={stats.primaryPupils.toString()} trend="+0%" isPositive={true} icon={<GraduationCap className="w-5 h-5" />} color="bg-teal-50 text-teal-600" />
        <StatCard title="Total Arrears" value={`$${stats.revenue}`} trend="Real-time" isPositive={false} icon={<DollarSign className="w-5 h-5" />} color="bg-green-50 text-green-600" />
        <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} trend="Overall" isPositive={true} icon={<ClipboardCheck className="w-5 h-5" />} color="bg-amber-50 text-amber-600" />
        <StatCard title="Staff Count" value={stats.staffCount.toString()} trend="Active" isPositive={true} icon={<Briefcase className="w-5 h-5" />} color="bg-rose-50 text-rose-600" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <QuickAction icon={<UserPlus className="w-4 h-4" />} label="New Admission" color="bg-blue-500" />
          <QuickAction icon={<DollarSign className="w-4 h-4" />} label="Record Payment" color="bg-green-500" />
          <QuickAction icon={<ClipboardCheck className="w-4 h-4" />} label="Take Attendance" color="bg-amber-500" />
          <QuickAction icon={<MessageSquare className="w-4 h-4" />} label="Send Message" color="bg-purple-500" />
          <QuickAction icon={<FileText className="w-4 h-4" />} label="Generate Reports" color="bg-rose-500" />
          <QuickAction icon={<Calendar className="w-4 h-4" />} label="View Calendar" color="bg-teal-500" />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Class Distribution (Real Data) */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Class Distribution</h3>
            <p className="text-[11px] text-gray-500">Live pupil distribution across grades</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-[200px] w-full md:w-1/2">
              {distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-gray-400 italic">No pupil data available</div>
              )}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 w-full">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-[10px]">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 truncate">{item.name}</span>
                  <span className="text-gray-400 font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Admissions (Real Data) */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Recent Applications</h3>
            <button className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1">
              Pipeline <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {admissions.slice(0, 5).map((app: any) => (
              <ActivityItem 
                key={app.id}
                icon={<Clock className="h-3.5 w-3.5" />} 
                color="text-blue-500" 
                text={`New application for ${app.studentName} (${app.grade})`} 
                time={app.submissionDate || 'Recently'} 
              />
            ))}
            {admissions.length === 0 && (
              <div className="text-center py-12 text-xs text-gray-400 italic">No recent applications</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5">
      <p className="text-[10px] text-white/60 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function StatCard({ title, value, trend, isPositive, icon, color }: { 
  title: string, value: string, trend: string, isPositive: boolean, icon: React.ReactNode, color: string 
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-300 group cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${color}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-0.5 text-[11px] font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend}
        </div>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{title}</p>
    </div>
  );
}

function QuickAction({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
  return (
    <button className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all duration-200 group">
      <div className={`w-10 h-10 rounded-lg text-white flex items-center justify-center group-hover:scale-110 transition-transform ${color}`}>
        {icon}
      </div>
      <span className="text-[11px] font-medium text-gray-600 text-center">{label}</span>
    </button>
  );
}

function ActivityItem({ icon, color, text, time }: { icon: React.ReactNode, color: string, text: string, time: string }) {
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className={`mt-0.5 shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-700 leading-tight group-hover:text-gray-900 transition-colors">{text}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}
