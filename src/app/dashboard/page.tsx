"use client"

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

const enrolmentData = [
  { name: 'Feb', primary: 850, ecd: 300 },
  { name: 'Apr', primary: 880, ecd: 310 },
  { name: 'Jun', primary: 900, ecd: 320 },
  { name: 'Jul', primary: 910, ecd: 325 },
  { name: 'Aug', primary: 920, ecd: 330 },
  { name: 'Oct', primary: 940, ecd: 340 },
  { name: 'Dec', primary: 950, ecd: 342 },
];

const financeData = [
  { name: 'Feb', revenue: 35000, expenses: 22000 },
  { name: 'Apr', revenue: 38000, expenses: 23500 },
  { name: 'Jun', revenue: 42000, expenses: 24000 },
  { name: 'Aug', revenue: 45000, expenses: 25000 },
  { name: 'Oct', revenue: 48000, expenses: 26500 },
  { name: 'Dec', revenue: 52000, expenses: 28000 },
];

const distributionData = [
  { name: 'Baby Class', value: 85, color: '#8B5CF6' },
  { name: 'Middle Class', value: 110, color: '#A78BFA' },
  { name: 'Reception', value: 147, color: '#C4B5FD' },
  { name: 'Grade 1', value: 145, color: '#0D9488' },
  { name: 'Grade 2', value: 138, color: '#14B8A6' },
  { name: 'Grade 3', value: 130, color: '#2DD4BF' },
  { name: 'Grade 4', value: 125, color: '#5EEAD4' },
  { name: 'Grade 5', value: 120, color: '#99F6E4' },
  { name: 'Grade 6', value: 118, color: '#F59E0B' },
  { name: 'Grade 7', value: 129, color: '#FBBF24' },
];

const attendanceData = [
  { name: 'Mon', present: 94, absent: 6 },
  { name: 'Tue', present: 92, absent: 8 },
  { name: 'Wed', present: 95, absent: 5 },
  { name: 'Thu', present: 93, absent: 7 },
  { name: 'Fri', present: 91, absent: 9 },
];

export default function DashboardPage() {
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
          <h2 className="text-xl font-bold">Good Morning, Dr. Mutendi</h2>
          <p className="text-sm text-white/70 mt-1">Welcome back to EduCare360. Here's your school overview for today, Tuesday 24 February 2026.</p>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <HeroMetric label="Today's Attendance" value="94.7%" />
            <HeroMetric label="Fees Collected Today" value="$2,450" />
            <HeroMetric label="New Applications" value="3" />
            <HeroMetric label="Pending Tasks" value="12" />
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Enrolment" value="1,247" trend="+12.5%" isPositive={true} icon={<Users className="w-5 h-5" />} color="bg-blue-50 text-blue-600" />
        <StatCard title="ECD Pupils" value="342" trend="+8.3%" isPositive={true} icon={<Baby className="w-5 h-5" />} color="bg-purple-50 text-purple-600" />
        <StatCard title="Primary Pupils" value="905" trend="+14.2%" isPositive={true} icon={<GraduationCap className="w-5 h-5" />} color="bg-teal-50 text-teal-600" />
        <StatCard title="Revenue (Term)" value="$184,520" trend="+22.1%" isPositive={true} icon={<DollarSign className="w-5 h-5" />} color="bg-green-50 text-green-600" />
        <StatCard title="Attendance Rate" value="94.7%" trend="-1.2%" isPositive={false} icon={<ClipboardCheck className="w-5 h-5" />} color="bg-amber-50 text-amber-600" />
        <StatCard title="Staff Count" value="86" trend="+4" isPositive={true} icon={<Briefcase className="w-5 h-5" />} color="bg-rose-50 text-rose-600" />
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

      {/* Charts Grid - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Enrolment Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Enrolment Trend</h3>
              <p className="text-[11px] text-gray-500">ECD vs Primary growth over 12 months</p>
            </div>
            <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2.5 py-1 rounded-full">+12.5% YoY</span>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrolmentData}>
                <defs>
                  <linearGradient id="ecdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Area type="monotone" dataKey="primary" stroke="#0D9488" fillOpacity={1} fill="url(#primaryGrad)" strokeWidth={2} name="Primary" />
                <Area type="monotone" dataKey="ecd" stroke="#8B5CF6" fillOpacity={1} fill="url(#ecdGrad)" strokeWidth={2} name="ECD" />
                <Legend verticalAlign="bottom" align="center" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Finance Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Revenue vs Expenses</h3>
              <p className="text-[11px] text-gray-500">Financial performance overview</p>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors bg-white text-gray-800 shadow-sm">Monthly</button>
              <button className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors text-gray-500">Quarterly</button>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                />
                <Bar dataKey="revenue" fill="#0D9488" radius={[4, 4, 0, 0]} barSize={20} name="Revenue" />
                <Bar dataKey="expenses" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={20} name="Expenses" />
                <Legend verticalAlign="bottom" align="center" iconType="rect" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Class Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Class Distribution</h3>
            <p className="text-[11px] text-gray-500">Pupils per class/grade</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-[200px] w-full md:w-1/2">
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

        {/* Weekly Attendance */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Weekly Attendance</h3>
            <p className="text-[11px] text-gray-500">This week's attendance rates</p>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF'}} width={40} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                />
                <Bar dataKey="present" stackId="a" fill="#0D9488" radius={[0, 4, 4, 0]} name="Present" />
                <Bar dataKey="absent" stackId="a" fill="#FCA5A5" radius={[0, 4, 4, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Recent Activity</h3>
            <button className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            <ActivityItem 
              icon={<CircleCheck className="h-3.5 w-3.5" />} 
              color="text-green-500" 
              text="Fee payment of $350 received from Tendai Moyo (Grade 4A)" 
              time="5 min ago" 
            />
            <ActivityItem 
              icon={<Clock className="h-3.5 w-3.5" />} 
              color="text-blue-500" 
              text="New admission application submitted by Chipo Banda for Grade 3" 
              time="15 min ago" 
            />
            <ActivityItem 
              icon={<TriangleAlert className="h-3.5 w-3.5" />} 
              color="text-amber-500" 
              text="Attendance below 90% for Grade 2B this week" 
              time="1 hr ago" 
            />
            <ActivityItem 
              icon={<CircleCheck className="h-3.5 w-3.5" />} 
              color="text-green-500" 
              text="Term 1 report cards generated for Grade 5 (45 pupils)" 
              time="2 hrs ago" 
            />
            <ActivityItem 
              icon={<CircleX className="h-3.5 w-3.5" />} 
              color="text-red-500" 
              text="Allergy alert: Peanut allergy flagged for Pupil #2045 during lunch" 
              time="3 hrs ago" 
            />
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Upcoming Events</h3>
            <button className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1">
              Calendar <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            <EventItem month="Feb" day="25" title="Parent-Teacher Conference" type="event" color="bg-blue-500" />
            <EventItem month="Feb" day="28" title="Staff Meeting" type="meeting" color="bg-purple-500" />
            <EventItem month="Mar" day="01" title="Term 1 Exams Begin" type="exam" color="bg-red-500" />
            <EventItem month="Mar" day="05" title="Sports Day" type="event" color="bg-green-500" />
            <EventItem month="Mar" day="10" title="ECD Open Day" type="event" color="bg-amber-500" />
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

function EventItem({ month, day, title, type, color }: { month: string, day: string, title: string, type: string, color: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="text-center min-w-[40px] shrink-0">
        <p className="text-[10px] text-gray-400 uppercase font-medium">{month}</p>
        <p className="text-lg font-bold text-gray-800 leading-none">{day}</p>
      </div>
      <div className={`w-1 h-10 rounded-full shrink-0 ${color}`} />
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-700 truncate group-hover:text-gray-900 transition-colors">{title}</p>
        <p className="text-[10px] text-gray-400 capitalize">{type}</p>
      </div>
    </div>
  );
}
