
"use client"

import { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  DollarSign, 
  MessageSquare,
  Clock,
  Calendar,
  Loader2,
  AlertCircle,
  Heart,
  Database,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Mail,
  UserPlus,
  Search,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  MoreHorizontal,
  Plus,
  Check,
  X
} from 'lucide-react';
import { useUserProfile, useDatabase, useRTDBCollection, useRTDBDoc } from '@/firebase';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { studentService } from '@/services/students';
import { notificationService } from '@/services/notifications';
import { Student, UserProfile } from '@/lib/types';

export default function ParentPortalPage() {
  const { profile, loading: profileLoading } = useUserProfile();
  const database = useDatabase();
  const { toast } = useToast();
  
  const { data: students, loading: studentsLoading } = useRTDBCollection<Student>(database, 'students');
  const { data: users, loading: usersLoading } = useRTDBCollection<UserProfile>(database, 'users');
  const { data: announcements, loading: msgsLoading } = useRTDBCollection(database, 'announcements');
  const { data: schoolSettings } = useRTDBDoc(database, 'system_settings');
  
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // UI States
  const [isEditEmailOpen, setIsEditEmailOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  
  // Action States
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [linkingParentEmail, setLinkingParentEmail] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';
  const currencySymbol = schoolSettings?.currencySymbol || '$';

  const myChildren = useMemo(() => {
    if (!students || !profile?.email) return [];
    return students.filter(s => s.parentEmail?.toLowerCase() === profile.email?.toLowerCase());
  }, [students, profile?.email]);

  const activeChild = useMemo(() => {
    if (selectedChildId) return myChildren.find(c => c.id === selectedChildId);
    return myChildren[0];
  }, [myChildren, selectedChildId]);

  const familyManagementData = useMemo(() => {
    if (!isAdmin || !students || !users) return [];
    
    const parentAccounts = users.filter(u => u.role === 'parent');
    const studentEmails = Array.from(new Set(students.map(s => s.parentEmail?.toLowerCase()).filter(Boolean)));
    
    const registryMap = new Map<string, any>();
    
    parentAccounts.forEach(account => {
      const email = account.email?.toLowerCase() || '';
      registryMap.set(email, {
        email,
        accountExists: true,
        displayName: account.displayName || 'Unnamed Parent',
        students: students.filter(s => s.parentEmail?.toLowerCase() === email),
        userId: account.uid,
        lastLogin: account.createdAt
      });
    });

    studentEmails.forEach(email => {
      if (!registryMap.has(email)) {
        const linkedStudents = students.filter(s => s.parentEmail?.toLowerCase() === email);
        registryMap.set(email, {
          email,
          accountExists: false,
          displayName: linkedStudents[0]?.guardianName || 'Pending Registration',
          students: linkedStudents,
          userId: null
        });
      }
    });
    
    return Array.from(registryMap.values()).filter(f => 
      f.email.includes(search.toLowerCase()) || 
      f.displayName.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, users, isAdmin, search]);

  const availableStudentsForLink = useMemo(() => {
    if (!isLinkOpen) return [];
    return students.filter(s => {
      const matchesSearch = s.studentName.toLowerCase().includes(studentSearch.toLowerCase()) || 
                           s.grade.toLowerCase().includes(studentSearch.toLowerCase());
      return matchesSearch;
    });
  }, [students, isLinkOpen, studentSearch]);

  const handleUpdateEmail = async () => {
    if (!editingStudent || !newEmail) return;
    setIsUpdating(true);
    try {
      await studentService.updateParentEmail(database, editingStudent.id, newEmail);
      setIsEditEmailOpen(false);
      setEditingStudent(null);
      toast({ title: "Email Updated", description: "Parent contact record synchronized." });
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLinkStudents = async () => {
    if (selectedStudentIds.length === 0 || !linkingParentEmail) return;
    setIsUpdating(true);
    try {
      await studentService.bulkUpdateParentEmail(database, selectedStudentIds, linkingParentEmail);
      setIsLinkOpen(false);
      setSelectedStudentIds([]);
      setStudentSearch('');
      toast({ 
        title: "Students Linked", 
        description: `Associated ${selectedStudentIds.length} pupils with ${linkingParentEmail}.` 
      });
    } catch (e) {
      toast({ title: "Linking Failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendInvite = async (email: string) => {
    try {
      await notificationService.resendPortalInvite(database, email);
      toast({ 
        title: "Invitation Resent", 
        description: `Registration instructions sent to ${email}.` 
      });
    } catch (e) {
      toast({ title: "Error", description: "Failed to resend invite.", variant: "destructive" });
    }
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  if (studentsLoading || profileLoading || usersLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-rose-600" />
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Synchronizing Family Registry...</p>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Family & Parent Portal Registry</h2>
              <p className="text-sm text-white/80 mt-1">Manage portal access, verify registrations, and audit parent-student links</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden md:flex px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
                <Database className="w-3.5 h-3.5" /> Registry Live
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminStatCard label="Total Contacts" value={familyManagementData.length.toString()} icon={<Users className="h-4 w-4" />} color="bg-rose-50 text-rose-600" />
          <AdminStatCard label="Registered Accounts" value={familyManagementData.filter(f => f.accountExists).length.toString()} icon={<ShieldCheck className="h-4 w-4" />} color="bg-emerald-50 text-emerald-600" />
          <AdminStatCard label="Orphaned Emails" value={familyManagementData.filter(f => f.students.length === 0).length.toString()} icon={<AlertCircle className="h-4 w-4" />} color="bg-amber-50 text-amber-600" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input 
                className="pl-9 text-xs h-9" 
                placeholder="Search families by name or email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Monitoring {familyManagementData.length} records</p>
          </div>

          <div className="divide-y divide-gray-50">
            {familyManagementData.length > 0 ? familyManagementData.map((family) => (
              <div key={family.email} className="p-4 hover:bg-gray-50/50 transition-all flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-3 min-w-[250px]">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${family.accountExists ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    {family.displayName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{family.displayName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-gray-400 font-medium truncate">{family.email}</p>
                      {family.accountExists ? (
                        <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded shrink-0">
                          <CheckCircle2 className="h-2 w-2" /> PORTAL ACTIVE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[8px] font-bold text-amber-600 bg-amber-50 px-1 rounded shrink-0">
                          <AlertCircle className="h-2 w-2" /> NO ACCOUNT
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-wrap gap-2">
                  {family.students.length > 0 ? family.students.map(s => (
                    <div key={s.id} className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-100 rounded-lg group shadow-sm">
                      <div className="text-[10px]">
                        <span className="font-bold text-gray-700">{s.studentName}</span>
                        <span className="text-[9px] text-gray-400 ml-1.5 font-bold uppercase">{s.grade}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingStudent(s);
                          setNewEmail(s.parentEmail);
                          setIsEditEmailOpen(true);
                        }}
                        className="p-1 text-gray-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Edit2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-lg text-[9px] font-bold text-amber-600 uppercase">
                      <AlertCircle className="h-3 w-3" /> No Students Linked
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setLinkingParentEmail(family.email);
                      setSelectedStudentIds([]);
                      setIsLinkOpen(true);
                    }}
                    className="h-8 text-[10px] font-bold gap-1 border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                  >
                    <UserPlus className="h-3 w-3" /> Link Student
                  </Button>
                  {!family.accountExists && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleResendInvite(family.email)}
                      className="h-8 text-[10px] font-bold gap-1 border-rose-100 text-rose-600 hover:bg-rose-50"
                    >
                      <Mail className="h-3 w-3" /> Resend Invite
                    </Button>
                  )}
                </div>
              </div>
            )) : (
              <div className="py-20 text-center text-gray-400 text-xs italic">No matching families found in registry.</div>
            )}
          </div>
        </div>

        {/* Link Student Dialog */}
        <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Associate Students with Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Target Account</p>
                <p className="text-xs font-bold text-gray-800">{linkingParentEmail}</p>
              </div>
              
              <div className="space-y-3">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Search Registry</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input 
                    placeholder="Search name or grade..." 
                    className="pl-8 text-xs h-9"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
                
                <div className="max-h-[300px] overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50 custom-scrollbar">
                  {availableStudentsForLink.length > 0 ? availableStudentsForLink.map(s => (
                    <div 
                      key={s.id} 
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleStudentSelection(s.id)}
                    >
                      <Checkbox 
                        checked={selectedStudentIds.includes(s.id)}
                        onCheckedChange={() => toggleStudentSelection(s.id)}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-700 truncate">{s.studentName}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-medium">{s.grade}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-xs text-gray-400 italic">
                      No matching students available.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                disabled={isUpdating || selectedStudentIds.length === 0} 
                onClick={handleLinkStudents} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Link {selectedStudentIds.length} Students
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Email Dialog */}
        <Dialog open={isEditEmailOpen} onOpenChange={setIsEditEmailOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Parent Contact Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                <p className="text-[10px] font-bold text-rose-700 uppercase mb-1">Student Record</p>
                <p className="text-xs font-bold text-gray-800">{editingStudent?.studentName} ({editingStudent?.grade})</p>
              </div>
              <div className="space-y-2">
                <Label>Parent Email Address</Label>
                <Input 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  placeholder="parent@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button disabled={isUpdating} onClick={handleUpdateEmail} className="w-full bg-rose-600 hover:bg-rose-700 font-bold">
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Registry Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="30" r="80" fill="white" />
            <circle cx="50" cy="180" r="100" fill="white" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Welcome, {profile?.displayName || 'Parent'}</h2>
              <p className="text-xs text-white/80">Managing Family Progress at {schoolSettings?.schoolName || 'Sunrise Academy'}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {myChildren.map((child) => (
              <button 
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all border ${
                  activeChild?.id === child.id 
                    ? 'bg-white text-rose-600 border-white shadow-md' 
                    : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                }`}
              >
                <div className="text-left">
                  <p className="text-[11px] font-bold truncate max-w-[120px]">{child.studentName}</p>
                  <p className={`text-[9px] font-bold uppercase ${activeChild?.id === child.id ? 'text-rose-400' : 'text-white/60'}`}>{child.grade}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ParentMetricCard icon={<Award className="w-4 h-4 text-rose-600" />} label="Subjects Graded" value={activeChild?.marks ? Object.keys(activeChild.marks).length.toString() : '0'} color="bg-rose-50" />
        <ParentMetricCard icon={<TrendingUp className="w-4 h-4 text-emerald-600" />} label="Attendance Rate" value={`${activeChild?.attendanceRate || 0}%`} color="bg-emerald-50" />
        <ParentMetricCard icon={<DollarSign className="w-4 h-4 text-amber-600" />} label="Fee Balance" value={`${currencySymbol}${activeChild?.feeBalance || 0}`} color="bg-amber-50" 
          valueColor={parseFloat(activeChild?.feeBalance as any) > 0 ? "text-rose-600" : "text-emerald-600"} />
        <ParentMetricCard icon={<MessageSquare className="w-4 h-4 text-blue-600" />} label="Updates" value={announcements.length.toString()} color="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tight">
              <GraduationCap className="w-4 h-4 text-rose-500" /> Academic Performance
            </h4>
          </div>
          <div className="p-5 space-y-3">
            {activeChild?.marks ? Object.entries(activeChild.marks).map(([subject, score]: [string, any]) => (
              <div key={subject} className="flex flex-col gap-1.5 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">{subject}</span>
                  <span className="text-xs font-bold text-rose-600">{score}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${score}%` }} 
                  />
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-gray-400 italic text-xs">No marks recorded yet.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tight">
              <Calendar className="w-4 h-4 text-blue-500" /> Recent Updates
            </h4>
          </div>
          <div className="p-5 space-y-3">
            {announcements.slice(0, 5).map((msg: any) => (
              <div key={msg.id} className="p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700 uppercase">
                    {msg.communicationType}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-700 font-medium leading-relaxed">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParentMetricCard({ icon, label, value, color, valueColor = "text-gray-800" }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 shadow-sm`}>{icon}</div>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active</span>
      </div>
      <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{label}</p>
    </div>
  );
}

function AdminStatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>{icon}</div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registry</span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{label}</p>
    </div>
  );
}
