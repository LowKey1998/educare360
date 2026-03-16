
"use client"

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Database,
  Trash2,
  UserPlus,
  ArrowUpRight,
  ClipboardList,
  Mail,
  Clock,
  UserCheck,
  Loader2,
  Filter,
  CheckCircle2,
  XCircle,
  Users
} from 'lucide-react';
import { useDatabase, useRTDBCollection, useUserProfile } from '@/firebase';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { admissionService } from '@/services/admissions';
import { studentService } from '@/services/students';
import { Admission } from '@/lib/types';

const STATUS_CONFIG: Record<string, { color: string, dot: string, bg: string, icon: any }> = {
  'New': { color: 'text-blue-700', dot: 'bg-blue-500', bg: 'bg-blue-50', icon: Mail },
  'Under Review': { color: 'text-amber-700', dot: 'bg-amber-500', bg: 'bg-amber-50', icon: Clock },
  'Interview': { color: 'text-purple-700', dot: 'bg-purple-500', bg: 'bg-purple-50', icon: ClipboardList },
  'Accepted': { color: 'text-green-700', dot: 'bg-green-500', bg: 'bg-green-50', icon: CheckCircle2 },
  'Waitlisted': { color: 'text-gray-700', dot: 'bg-gray-500', bg: 'bg-gray-50', icon: Clock },
  'Rejected': { color: 'text-red-700', dot: 'bg-red-500', bg: 'bg-red-50', icon: XCircle },
};

const STATUS_LABELS = ['New', 'Under Review', 'Interview', 'Accepted', 'Waitlisted', 'Rejected'];

export default function AdmissionsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Admission | null>(null);
  
  const database = useDatabase();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const { data: applications, loading } = useRTDBCollection<Admission>(database, 'admissions');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';

  const filteredApps = useMemo(() => {
    if (!applications) return [];
    return applications.filter(a => {
      const matchesSearch = a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
                           a.applicationId?.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'in-progress' && ['Under Review', 'Interview'].includes(a.status)) ||
                        (activeTab === 'closed' && ['Waitlisted', 'Rejected'].includes(a.status)) ||
                        a.status.toLowerCase().replace(' ', '-') === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [applications, search, activeTab]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUS_LABELS.forEach(label => counts[label] = 0);
    applications.forEach(app => {
      if (counts[app.status] !== undefined) counts[app.status]++;
    });

    const total = applications.length;
    const accepted = counts['Accepted'] || 0;
    const rate = total > 0 ? ((accepted / total) * 100).toFixed(1) : '0.0';

    return { counts, rate };
  }, [applications]);

  const handleAddApp = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data: Omit<Admission, 'id' | 'createdAt'> = {
      studentName: formData.get('name') as string,
      grade: formData.get('grade') as string,
      age: parseInt(formData.get('age') as string),
      status: 'New',
      applicationId: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
      submissionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      docsPending: formData.get('docs') === 'on'
    };

    try {
      await admissionService.addApplication(database, data);
      setIsAddOpen(false);
      toast({ title: "Application Received" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnrollment = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!isAdmin || !selectedApp) return;
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const studentData: any = {
      studentName: selectedApp.studentName,
      grade: selectedApp.grade,
      admissionNo: formData.get('admNo'),
      gender: formData.get('gender'),
      guardianName: formData.get('guardianName'),
      guardianPhone: formData.get('guardianPhone'),
      parentEmail: (formData.get('parentEmail') as string).toLowerCase().trim(),
      status: 'Active',
    };

    try {
      await studentService.enrollFromAdmission(database, selectedApp.id, studentData);
      setIsEnrollOpen(false);
      setSelectedApp(null);
      toast({ title: "Enrollment Complete", description: `${selectedApp.studentName} is now an active pupil.` });
    } catch (e) {
      toast({ title: "Enrollment failed.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedAdmNo = useMemo(() => {
    const year = new Date().getFullYear();
    const random = Math.floor(100 + Math.random() * 899);
    return `${year}-${random}`;
  }, [isEnrollOpen]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Admissions Pipeline</h2>
            <p className="text-sm text-white/80 mt-1">Manage the institutional journey from applicant to registered pupil</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdmissionStat label="New Apps" value={loading ? '...' : stats.counts['New']?.toString()} icon={<Mail className="h-4 w-4" />} color="bg-blue-50 text-blue-600" />
        <AdmissionStat label="In Progress" value={loading ? '...' : ((stats.counts['Under Review'] || 0) + (stats.counts['Interview'] || 0)).toString()} icon={<ClipboardList className="h-4 w-4" />} color="bg-purple-50 text-purple-600" />
        <AdmissionStat label="Accepted" value={loading ? '...' : stats.counts['Accepted']?.toString()} icon={<CheckCircle2 className="h-4 w-4" />} color="bg-green-50 text-green-600" />
        <AdmissionStat label="Acceptance Rate" value={`${stats.rate}%`} icon={<ArrowUpRight className="h-4 w-4" />} color="bg-indigo-50 text-indigo-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input className="pl-9 text-xs h-9" placeholder="Search applicants..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {isAdmin && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 h-9 text-xs font-bold gap-1.5 shadow-sm">
                <Plus className="h-3.5 w-3.5" /> New Application
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddApp}>
                <DialogHeader><DialogTitle>Register New Application</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label>Student Full Name</Label>
                  <Input name="name" required />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Grade</Label>
                      <Select name="grade" defaultValue="Grade 1">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input name="age" type="number" required />
                    </div>
                  </div>
                </div>
                <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full">Submit Application</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border border-gray-100 p-1 h-auto mb-6 gap-1 shadow-sm rounded-xl">
          <TabsTrigger value="all" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">All Apps</TabsTrigger>
          <TabsTrigger value="new" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">New</TabsTrigger>
          <TabsTrigger value="in-progress" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">In Progress</TabsTrigger>
          <TabsTrigger value="accepted" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-green-50 data-[state=active]:text-green-700">Accepted</TabsTrigger>
          <TabsTrigger value="closed" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="m-0">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredApps.map((app) => (
                <div key={app.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm relative group">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] font-mono text-gray-400">{app.applicationId}</p>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-blue-600">{app.status}</span>
                  </div>
                  <div className="space-y-1 mb-4">
                    <p className="text-xs font-bold text-gray-800">{app.studentName}</p>
                    <p className="text-[10px] text-gray-500">{app.grade} • Age {app.age}</p>
                  </div>
                  {app.status === 'Accepted' && isAdmin && !app.enrolledId && (
                    <Button 
                      onClick={() => { setSelectedApp(app); setIsEnrollOpen(true); }}
                      size="sm" 
                      className="w-full bg-emerald-50 text-emerald-700 text-[10px] font-bold h-8 hover:bg-emerald-100 border-none shadow-none"
                    >
                      <UserCheck className="h-3 w-3 mr-1.5" /> Process Enrollment
                    </Button>
                  )}
                  {app.enrolledId && (
                    <div className="w-full py-1.5 bg-gray-50 text-gray-400 text-[9px] font-bold rounded-lg border border-gray-100 text-center uppercase tracking-widest">
                      <Database className="h-2.5 w-2.5 inline mr-1" /> Enrolled
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Enrollment Dialog */}
      <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
        <DialogContent>
          <form onSubmit={handleEnrollment}>
            <DialogHeader><DialogTitle>Finalize Enrollment</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">Pre-filled Data</p>
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>{selectedApp?.studentName}</span>
                  <span className="text-blue-600">{selectedApp?.grade}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Admission No</Label>
                  <Input name="admNo" defaultValue={suggestedAdmNo} required />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select name="gender" defaultValue="Male">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Guardian Name</Label>
                  <Input name="guardianName" required />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input name="guardianPhone" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Parent Email (for Portal)</Label>
                <Input name="parentEmail" type="email" required />
              </div>
            </div>
            <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600">Complete Institutional Enrollment</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdmissionStat({ label, value, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</span>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shadow-sm`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
