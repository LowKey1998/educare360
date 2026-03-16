
"use client"

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Database,
  Trash2,
  UserPlus,
  ArrowUpRight,
  ClipboardList,
  Mail,
  Clock,
  UserCheck,
  Loader2
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
import { useToast } from '@/hooks/use-toast';
import { admissionService } from '@/services/admissions';
import { studentService } from '@/services/students';
import { Admission } from '@/lib/types';

const STATUS_CONFIG: Record<string, { color: string, dot: string, bg: string }> = {
  'New': { color: 'text-blue-700', dot: 'bg-blue-500', bg: 'bg-blue-50' },
  'Under Review': { color: 'text-amber-700', dot: 'bg-amber-500', bg: 'bg-amber-50' },
  'Interview': { color: 'text-purple-700', dot: 'bg-purple-500', bg: 'bg-purple-50' },
  'Accepted': { color: 'text-green-700', dot: 'bg-green-500', bg: 'bg-green-50' },
  'Waitlisted': { color: 'text-gray-700', dot: 'bg-gray-500', bg: 'bg-gray-50' },
  'Rejected': { color: 'text-red-700', dot: 'bg-red-500', bg: 'bg-red-50' },
};

const STATUS_LABELS = ['New', 'Under Review', 'Interview', 'Accepted', 'Waitlisted', 'Rejected'];

export default function AdmissionsPage() {
  const [search, setSearch] = useState('');
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
    return applications.filter(a => 
      a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      a.applicationId?.toLowerCase().includes(search.toLowerCase())
    );
  }, [applications, search]);

  const stats = useMemo(() => {
    const groups: Record<string, Admission[]> = {};
    STATUS_LABELS.forEach(label => groups[label] = []);
    filteredApps.forEach(app => {
      const status = app.status || 'New';
      if (groups[status]) groups[status].push(app);
    });

    const total = filteredApps.length;
    const accepted = groups['Accepted'].length;
    const rate = total > 0 ? ((accepted / total) * 100).toFixed(1) : '0.0';

    return { groups, rate };
  }, [filteredApps]);

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
      parentEmail: formData.get('parentEmail'),
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Admissions & Enrolment</h2>
            <p className="text-sm text-white/80 mt-1">Manage pupil applications and transition accepted candidates to active pupils</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3 h-3" /> Registry Sync
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdmissionStat label="New Applications" value={loading ? '...' : stats.groups['New']?.length.toString()} icon={<Mail className="h-4 w-4" />} color="bg-blue-50 text-blue-600" />
        <AdmissionStat label="Interviews" value={loading ? '...' : stats.groups['Interview']?.length.toString()} icon={<ClipboardList className="h-4 w-4" />} color="bg-purple-50 text-purple-600" />
        <AdmissionStat label="Waitlisted" value={loading ? '...' : stats.groups['Waitlisted']?.length.toString()} icon={<Clock className="h-4 w-4" />} color="bg-gray-50 text-gray-600" />
        <AdmissionStat label="Acceptance Rate" value={`${stats.rate}%`} icon={<ArrowUpRight className="h-4 w-4" />} color="bg-green-50 text-green-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input 
            className="pl-9 text-xs h-9" 
            placeholder="Search applications..." 
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
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600">
                    {isSubmitting ? "Processing..." : "Submit Application"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar">
        {STATUS_LABELS.map(label => (
          <div key={label} className="bg-gray-50/50 rounded-xl p-3 min-w-[280px] w-[280px] h-fit border border-gray-100">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[label].dot}`} />
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">{label}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">
                {loading ? '...' : stats.groups[label]?.length || 0}
              </span>
            </div>
            
            <div className="space-y-2.5">
              {stats.groups[label]?.map((app) => (
                <div key={app.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-mono text-gray-400">{app.applicationId}</p>
                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Select onValueChange={(val) => updateStatus(app.id, val)}>
                          <SelectTrigger className="h-6 w-6 p-0 border-none bg-transparent outline-none">
                            <MoreHorizontal className="h-3.5 w-3.5 text-gray-400" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_LABELS.map(s => (
                              <SelectItem key={s} value={s} className="text-[10px]">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <button onClick={() => handleDelete(app.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-800 mb-1">{app.studentName}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{app.grade} • Age {app.age}</p>
                  
                  {label === 'Accepted' && isAdmin && !app.enrolledId && (
                    <button 
                      onClick={() => { setSelectedApp(app); setIsEnrollOpen(true); }}
                      className="mt-3 w-full py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="h-3 w-3" /> Process Enrollment
                    </button>
                  )}

                  {app.enrolledId && (
                    <div className="mt-3 py-1 bg-gray-50 text-gray-400 text-[9px] font-bold rounded-lg border border-gray-100 text-center uppercase tracking-widest flex items-center justify-center gap-1">
                      <Database className="h-2.5 w-2.5" /> Enrolled in Registry
                    </div>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[9px] text-gray-400 font-bold uppercase">{app.submissionDate}</span>
                    {app.docsPending && <span className="text-[9px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded">PENDING DOCS</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

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
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">Application Summary</p>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-gray-700">{selectedApp?.studentName}</span>
                  <span className="text-blue-600 font-bold">{selectedApp?.grade}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Admission Number</Label>
                  <Input name="admNo" placeholder="e.g. 2026-001" required />
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
