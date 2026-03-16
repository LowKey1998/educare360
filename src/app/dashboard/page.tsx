
"use client"

import { useMemo } from 'react';
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
  Loader2,
  Heart,
  Award,
  ArrowRight
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
import Link from 'next/link';

export default function DashboardPage() {
  const database = useDatabase();
  const { profile, loading: profileLoading } = useUserProfile();
  
  // Real-time data streams
  const { data: students, loading: studentsLoading } = useRTDBCollection(database, 'students');
  const { data: admissions, loading: admissionsLoading } = useRTDBCollection(database, 'admissions');
  const { data: users, loading: usersLoading } = useRTDBCollection(database, 'users');
  const { data: announcements, loading: announcementsLoading } = useRTDBCollection(database, 'announcements');

  const loading = studentsLoading || admissionsLoading || usersLoading || profileLoading || announcementsLoading;

  // Role Checks
  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';
  const isParent = profile?.role === 'parent';

  // Parent Specific Logic
  const myChildren = useMemo(() => {
    if (!isParent || !profile?.email) return [];
    return students.filter(s => s.parentEmail?.toLowerCase() === profile.email?.toLowerCase());
  }, [students, profile?.email, isParent]);

  // Admin Memoized Metrics
  const adminStats = useMemo(() => {
    const totalEnrolment = students.length;
    const staffCount = users.filter(u => u.role === 'admin' || u.role === 'staff').length;
    const totalRevenue = students.reduce((acc, s) => acc + (parseFloat(s.feeBalance) || 0), 0);
    const avgAttendance = students.length > 0 
      ? students.reduce((acc, s) => acc + (parseFloat(s.attendanceRate) || 0), 0) / students.length 
      : 0;

    return {
      totalEnrolment,
      staffCount,
      revenue: totalRevenue.toLocaleString(),
      newApps: admissions.filter(a => a.status === 'New').length,
      attendance: avgAttendance.toFixed(1),
      events: announcements.length
    };
  }, [students, admissions, users, announcements]);

  // Parent Memoized Metrics
  const parentStats = useMemo(() => {
    const totalArrears = myChildren.reduce((acc, s) => acc + (parseFloat(s.feeBalance) || 0), 0);
    const avgAttendance = myChildren.length > 0 
      ? myChildren.reduce((acc, s) => acc + (parseFloat(s.attendanceRate) || 0), 0) / myChildren.length 
      : 0;
    return {
      childCount: myChildren.length,
      arrears: totalArrears.toLocaleString(),
      attendance: avgAttendance.toFixed(1)
    };
  }, [myChildren]);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">Syncing institutional data...</p>
      </div>
    );
  }

  // --- PARENT DASHBOARD VIEW ---
  if (isParent) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-gradient-to-r from-rose-600 to-pink-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <h2 className="text-xl font-bold">Welcome back, {profile?.displayName || 'Parent'}</h2>
            <p className="text-sm text-white/80 mt-1">Managing your family's educational journey at Sunrise Academy.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <HeroMetric label="My Children" value={parentStats.childCount.toString()} />
              <HeroMetric label="Total Arrears" value={`$${parentStats.arrears}`} />
              <HeroMetric label="Avg Attendance" value={`${parentStats.attendance}%`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/parent-portal" className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Child Profiles</p>
                <p className="text-xs text-gray-500">View performance & attendance</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/finance" className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Payments & Fees</p>
                <p className="text-xs text-gray-500">Pay fees & view statements</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/communication" className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">School Messages</p>
                <p className="text-xs text-gray-500">Read school announcements</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-rose-500" /> Recent Performance
            </h3>
            <div className="space-y-4">
              {myChildren.map(child => (
                <div key={child.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-700">{child.studentName}</p>
                    <span className="text-[10px] font-bold text-rose-600 uppercase">{child.grade}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: `${child.attendanceRate}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">{child.attendanceRate}% Att.</span>
                  </div>
                </div>
              ))}
              {myChildren.length === 0 && (
                <p className="text-center text-xs text-gray-400 italic py-8">No linked student records found.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" /> Recent Announcements
            </h3>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="p-3 border border-gray-50 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="text-xs font-bold text-gray-700">{ann.communicationType || 'Update'}</p>
                  <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">{ann.content}</p>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No recent announcements found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN DASHBOARD VIEW ---
  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-[#1E3A5F] via-[#1E3A5F] to-[#0D9488] rounded-xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold">Good Day, {profile?.displayName || 'Admin'}</h2>
          <p className="text-sm text-white/70 mt-1">Institutional Overview for {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <HeroMetric label="Global Enrollment" value={adminStats.totalEnrolment.toString()} />
            <HeroMetric label="Total Arrears" value={`$${adminStats.revenue}`} />
            <HeroMetric label="New Apps" value={adminStats.newApps.toString()} />
            <HeroMetric label="Workforce" value={adminStats.staffCount.toString()} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Enrolment" value={adminStats.totalEnrolment.toString()} trend="+12%" isPositive={true} icon={<Users className="w-5 h-5" />} color="bg-blue-50 text-blue-600" />
        <StatCard title="Revenue" value={`$${adminStats.revenue}`} trend="+22%" isPositive={true} icon={<DollarSign className="w-5 h-5" />} color="bg-green-50 text-green-600" />
        <StatCard title="Attendance" value={`${adminStats.attendance}%`} trend="Live" isPositive={true} icon={<ClipboardCheck className="w-5 h-5" />} color="bg-amber-50 text-amber-600" />
        <StatCard title="Staff" value={adminStats.staffCount.toString()} trend="+4" isPositive={true} icon={<Briefcase className="w-5 h-5" />} color="bg-rose-50 text-rose-600" />
        <StatCard title="Applications" value={adminStats.newApps.toString()} trend="Live" isPositive={true} icon={<UserPlus className="w-5 h-5" />} color="bg-indigo-50 text-indigo-600" />
        <StatCard title="Events" value={adminStats.events.toString()} trend="Announcements" isPositive={true} icon={<Calendar className="w-5 h-5" />} color="bg-teal-50 text-teal-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Administrative Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <AdminQuickAction href="/dashboard/admissions" icon={<UserPlus className="w-4 h-4" />} label="New Admission" color="bg-blue-500" />
          <AdminQuickAction href="/dashboard/finance" icon={<DollarSign className="w-4 h-4" />} label="Record Payment" color="bg-green-500" />
          <AdminQuickAction href="/dashboard/attendance" icon={<ClipboardCheck className="w-4 h-4" />} label="Take Attendance" color="bg-amber-500" />
          <AdminQuickAction href="/dashboard/communication" icon={<MessageSquare className="w-4 h-4" />} label="Send Message" color="bg-purple-500" />
          <AdminQuickAction href="/dashboard/documents" icon={<FileText className="w-4 h-4" />} label="Generate Reports" color="bg-rose-500" />
          <AdminQuickAction href="/dashboard/calendar" icon={<Calendar className="w-4 h-4" />} label="View Calendar" color="bg-teal-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Institutional Activity</h3>
          <div className="space-y-3">
            <ActivityItem icon={<CircleCheck className="h-3.5 w-3.5" />} color="text-green-500" text="System settings updated by administrator" time="Just now" />
            <ActivityItem icon={<Clock className="h-3.5 w-3.5" />} color="text-blue-500" text={`Registry check: ${adminStats.totalEnrolment} pupils active`} time="1 hr ago" />
            <ActivityItem icon={<TriangleAlert className="h-3.5 w-3.5" />} color="text-amber-500" text="Fee statement generation job started" time="2 hrs ago" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-12 h-12 text-teal-100 mb-2" />
          <p className="text-sm font-bold text-gray-800">Growth Analysis</p>
          <p className="text-xs text-gray-500 max-w-xs mt-1">Enrollment is up 12.5% YoY. View the Analytics section for detailed reporting.</p>
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

function StatCard({ title, value, trend, isPositive, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-300 group cursor-default">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${color}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-0.5 text-[11px] font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {trend}
        </div>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{title}</p>
    </div>
  );
}

function AdminQuickAction({ icon, label, color, href }: any) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all duration-200 group">
      <div className={`w-10 h-10 rounded-lg text-white flex items-center justify-center group-hover:scale-110 transition-transform ${color}`}>
        {icon}
      </div>
      <span className="text-[11px] font-medium text-gray-600 text-center">{label}</span>
    </Link>
  );
}

function ActivityItem({ icon, color, text, time }: any) {
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`mt-0.5 shrink-0 ${color}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-700 leading-tight">{text}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}
