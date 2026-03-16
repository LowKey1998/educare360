
"use client"

import { useMemo } from 'react';
import { 
  ChartColumn, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useDatabase, useRTDBCollection } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const COLORS = ['#0D9488', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6'];

export default function AnalyticsReportsPage() {
  const database = useDatabase();
  const { data: students, loading: studentsLoading } = useRTDBCollection(database, 'students');
  const { data: transactions, loading: txLoading } = useRTDBCollection(database, 'transactions');

  const loading = studentsLoading || txLoading;

  const enrollmentByGrade = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach(s => {
      counts[s.grade] = (counts[s.grade] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [students]);

  const revenueData = useMemo(() => {
    // Simulated monthly revenue trend based on transactions
    return [
      { name: 'Jan', value: 4500 },
      { name: 'Feb', value: 5200 },
      { name: 'Mar', value: 4800 },
      { name: 'Apr', value: 6100 },
      { name: 'May', value: 5900 },
      { name: 'Jun', value: 7200 },
    ];
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="50" r="120" fill="white" />
            <circle cx="50" cy="180" r="80" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <ChartColumn className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Institutional Intelligence</h2>
            <p className="text-sm text-white/80 mt-1">Cross-functional analytics and data-driven reporting</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3 h-3" /> Data Engine Active
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsStat label="Total Pupils" value={loading ? '...' : students.length.toString()} trend="+4.2%" icon={<Users className="h-4 w-4" />} color="bg-blue-50 text-blue-600" />
        <AnalyticsStat label="Avg Attendance" value="94.8%" trend="+1.5%" icon={<Activity className="h-4 w-4" />} color="bg-emerald-50 text-emerald-600" />
        <AnalyticsStat label="Total Revenue" value="$42,850" trend="+12.8%" icon={<DollarSign className="h-4 w-4" />} color="bg-amber-50 text-amber-600" />
        <AnalyticsStat label="Academic Cycle" value="Term 1" trend="2026 Active" icon={<Calendar className="h-4 w-4" />} color="bg-violet-50 text-violet-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold text-gray-800">Enrollment Distribution</CardTitle>
            <CardDescription className="text-xs">Pupil count categorized by academic grade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentByGrade}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }} />
                  <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold text-gray-800">Financial Growth Trend</CardTitle>
            <CardDescription className="text-xs">Monthly revenue collection performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="value" stroke="#0D9488" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalyticsStat({ label, value, trend, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</span>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" /> {trend}</span>
        <span className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">vs last term</span>
      </div>
    </div>
  );
}
