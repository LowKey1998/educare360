"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { 
  Users, 
  UserCheck, 
  FileCheck, 
  Clock, 
  TrendingUp, 
  Activity,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Mon', attendance: 92 },
  { name: 'Tue', attendance: 95 },
  { name: 'Wed', attendance: 88 },
  { name: 'Thu', attendance: 94 },
  { name: 'Fri', attendance: 91 },
];

const enrollmentData = [
  { month: 'Jan', total: 400 },
  { month: 'Feb', total: 450 },
  { month: 'Mar', total: 480 },
  { month: 'Apr', total: 520 },
  { month: 'May', total: 560 },
  { month: 'Jun', total: 600 },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">Welcome back, {user?.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Here is what is happening at EduCare360 today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Enrollment" 
          value="1,284" 
          change="+12% from last month" 
          icon={<Users className="w-5 h-5 text-primary" />} 
        />
        <StatCard 
          title="Attendance Today" 
          value="94.2%" 
          change="+2.4% from yesterday" 
          icon={<UserCheck className="w-5 h-5 text-accent" />} 
        />
        <StatCard 
          title="Pending Applications" 
          value="24" 
          change="8 requiring review" 
          icon={<FileCheck className="w-5 h-5 text-primary" />} 
        />
        <StatCard 
          title="Avg. Performance" 
          value="B+" 
          change="Stable across grades" 
          icon={<TrendingUp className="w-5 h-5 text-accent" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Enrollment Growth
            </CardTitle>
            <CardDescription>Visualizing student intake for the current academic year.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-accent" />
              Quick Alerts
            </CardTitle>
            <CardDescription>Important updates requiring your attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertItem 
              title="Attendance Warning" 
              desc="Grade 10B attendance dropped below 85%" 
              time="2h ago"
              type="warning"
            />
            <AlertItem 
              title="New Application" 
              desc="Jane Doe applied for ECD program" 
              time="4h ago"
              type="info"
            />
            <AlertItem 
              title="Medical Record Update" 
              desc="3 students have expiring health certs" 
              time="1d ago"
              type="warning"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Weekly Attendance (%)</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--muted))', opacity: 0.2}}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="attendance" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EventItem date="Oct 12" title="Parent-Teacher Association Meeting" type="General" />
            <EventItem date="Oct 15" title="Annual Sports Meet 2024" type="Primary" />
            <EventItem date="Oct 20" title="Mid-term Assessment Week" type="Academic" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
  return (
    <Card className="border-border/50 bg-card/50 hover:bg-card transition-colors shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-muted rounded-lg">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{change}</p>
      </CardContent>
    </Card>
  );
}

function AlertItem({ title, desc, time, type }: { title: string, desc: string, time: string, type: 'warning' | 'info' }) {
  return (
    <div className="flex gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border/30">
      <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${type === 'warning' ? 'bg-destructive' : 'bg-primary'}`} />
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-semibold">
          <Clock className="h-3 w-3" />
          {time}
        </div>
      </div>
    </div>
  );
}

function EventItem({ date, title, type }: { date: string, title: string, type: string }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border/50">
      <div className="flex flex-col items-center justify-center bg-primary/10 text-primary p-2 rounded-lg min-w-[50px]">
        <span className="text-xs font-bold uppercase">{date.split(' ')[0]}</span>
        <span className="text-lg font-bold">{date.split(' ')[1]}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
    </div>
  );
}