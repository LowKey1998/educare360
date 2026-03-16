
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
      toast({ title: "Application Received", description: `Submitted for ${data.studentName}.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to submit application.", variant: "destructive" });
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
      toast({ title: "Error", description: "Enrollment failed.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    if (!isAdmin) return;
    try {
      await admissionService.updateStatus(database, id, newStatus);
      toast({ title: "Status Updated", description: `Application is now ${newStatus}.` });
    } catch (e) {
      toast({ title: "Error", description: "Update failed." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin || !confirm('Remove this application?')) return;
    try {
      await admissionService.deleteApplication(database, id);
      toast({ title: "Application Removed", description: "The record was deleted." });
    } catch (e) {
      toast({ title: "Error", description: "Deletion failed." });
    }
  };

  // Suggest an admission number: CURRENT_YEAR-XXX
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
            <h2 className="text-xl font-bold">Admissions & Enrolment</h2>
            <p className="text-sm text-white/80 mt-1">Manage institutional pipeline from applicant to registered pupil</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3 h-3" /> Registry Sync
            </div>
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
          <Input 
            className="pl-9 text-xs h-9 border-gray-200" 
            placeholder="Search applicants..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                  <div className="space-y-2">
                    <Label>Student Full Name</Label>
                    <Input name="name" placeholder="Full name" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Grade Applied For</Label>
                      <Select name="grade" defaultValue="Grade 1">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'].map(g => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input name="age" type="number" placeholder="6" required />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" name="docs" id="docs" className="rounded border-gray-300" />
                    <Label htmlFor="docs" className="text-xs">Documentation Pending</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600">
                    {isSubmitting ? "Processing..." : "Submit Application"}
                  </Button>
                </DialogFooter>
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
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-xs text-gray-400 italic">Syncing application logs...</p>
            </div>
          ) : filteredApps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredApps.map((app) => (
                <ApplicationCard 
                  key={app.id} 
                  app={app} 
                  isAdmin={isAdmin} 
                  onUpdateStatus={updateStatus}
                  onDelete={handleDelete}
                  onEnroll={() => { setSelectedApp(app); setIsEnrollOpen(true); }}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">No applications found in this category.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Enrollment Processing Dialog */}
      <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleEnrollment}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" />
                Finalize Institutional Enrollment
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-2">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">Application Summary (Auto-filled)</p>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-gray-700">{selectedApp?.studentName}</span>
                  <span className="text-blue-600 font-bold">{selectedApp?.grade}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Admission Number</Label>
                  <Input name="admNo" defaultValue={suggestedAdmNo} placeholder="e.g. 2026-001" required />
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
                  <Input name="guardianName" placeholder="Full name" required />
                </div>
                <div className="space-y-2">
                  <Label>Guardian Phone</Label>
                  <Input name="guardianPhone" placeholder="+263..." required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Parent Email (for Portal access)</Label>
                <Input name="parentEmail" type="email" placeholder="parent@example.com" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                Confirm Institutional Enrollment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApplicationCard({ app, isAdmin, onUpdateStatus, onDelete, onEnroll }: any) {
  const config = STATUS_CONFIG[app.status] || STATUS_CONFIG['New'];
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-mono text-gray-400 tracking-tighter">{app.applicationId}</p>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          <span className={`text-[10px] font-bold uppercase tracking-tight ${config.color}`}>{app.status}</span>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <p className="text-xs font-bold text-gray-800 truncate">{app.studentName}</p>
        <p className="text-[10px] text-gray-500 font-medium">{app.grade} • Age {app.age}</p>
      </div>

      {app.status === 'Accepted' && isAdmin && !app.enrolledId && (
        <button 
          onClick={onEnroll}
          className="w-full mb-3 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <UserCheck className="h-3 w-3" /> Process Enrollment
        </button>
      )}

      {app.enrolledId && (
        <div className="w-full mb-3 py-1.5 bg-gray-50 text-gray-400 text-[9px] font-bold rounded-lg border border-gray-100 text-center uppercase tracking-widest flex items-center justify-center gap-1">
          <Database className="h-2.5 w-2.5" /> Enrolled in Registry
        </div>
      )}

      <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
        <span className="text-[9px] text-gray-400 font-bold uppercase">{app.submissionDate}</span>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <Select onValueChange={(val) => onUpdateStatus(app.id, val)}>
              <SelectTrigger className="h-7 w-7 p-0 border-none bg-transparent outline-none focus:ring-0">
                <Filter className="h-3 w-3 text-gray-300 hover:text-blue-500 transition-colors" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_LABELS.map(s => (
                  <SelectItem key={s} value={s} className="text-[10px] font-bold">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isAdmin && (
            <button onClick={() => onDelete(app.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      
      {app.docsPending && (
        <div className="absolute -top-2 -right-1">
          <span className="text-[8px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold shadow-sm ring-2 ring-white">DOCS PENDING</span>
        </div>
      )}
    </div>
  );
}

function AdmissionStat({ label, value, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</span>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform shadow-sm`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
