"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { 
  Users, 
  Baby, 
  GraduationCap, 
  DollarSign, 
  ClipboardCheck, 
  Briefcase,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#115e59] p-10 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-headline mb-2 tracking-tight">Good Morning, Dr. Mutendi</h1>
          <p className="text-white/60 text-base font-medium mb-10 max-w-2xl">
            Welcome back to EduCare360. Here's your school overview for today, Tuesday 24 February 2026.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HeroMetric label="Today's Attendance" value="94.7%" />
            <HeroMetric label="Fees Collected Today" value="$2,450" />
            <HeroMetric label="New Applications" value="3" />
            <HeroMetric label="Pending Tasks" value="12" />
          </div>
        </div>
        
        {/* Abstract background glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Enrolment" 
          value="1,247" 
          trend="+12.5%" 
          isPositive={true}
          icon={<Users className="w-5 h-5 text-blue-500" />}
          iconBg="bg-blue-50"
        />
        <StatCard 
          title="ECD Pupils" 
          value="342" 
          trend="+8.3%" 
          isPositive={true}
          icon={<Baby className="w-5 h-5 text-purple-500" />}
          iconBg="bg-purple-50"
        />
        <StatCard 
          title="Primary Pupils" 
          value="905" 
          trend="+14.2%" 
          isPositive={true}
          icon={<GraduationCap className="w-5 h-5 text-teal-500" />}
          iconBg="bg-teal-50"
        />
        <StatCard 
          title="Revenue (Term)" 
          value="$184,520" 
          trend="+22.1%" 
          isPositive={true}
          icon={<DollarSign className="w-5 h-5 text-green-500" />}
          iconBg="bg-green-50"
        />
        <StatCard 
          title="Attendance Rate" 
          value="94.7%" 
          trend="-1.2%" 
          isPositive={false}
          icon={<ClipboardCheck className="w-5 h-5 text-amber-500" />}
          iconBg="bg-amber-50"
        />
        <StatCard 
          title="Staff Count" 
          value="86" 
          trend="+4" 
          isPositive={true}
          icon={<Briefcase className="w-5 h-5 text-pink-500" />}
          iconBg="bg-pink-50"
        />
      </div>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors cursor-default">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
      <span className="text-2xl font-bold tracking-tight">{value}</span>
    </div>
  );
}

function StatCard({ title, value, trend, isPositive, icon, iconBg }: { 
  title: string, 
  value: string, 
  trend: string, 
  isPositive: boolean, 
  icon: React.ReactNode,
  iconBg: string
}) {
  return (
    <Card className="border-none shadow-sm rounded-[1.5rem] p-6 hover:shadow-md transition-all duration-300 bg-white">
      <div className="flex items-start justify-between mb-6">
        <div className={`p-3 rounded-2xl ${iconBg}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {trend}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-bold tracking-tight text-gray-900">{value}</h3>
        <p className="text-xs font-semibold text-gray-400 tracking-tight uppercase">{title}</p>
      </div>
    </Card>
  );
}
