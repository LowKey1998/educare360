
"use client"

import { useState, useMemo } from 'react';
import { 
  Plus, 
  Users, 
  Briefcase, 
  Calendar, 
  Search, 
  Mail,
  Loader2,
  Trash2,
  Edit,
  Database,
  ShieldCheck,
  UserCheck,
  UserCog,
  TrendingUp,
  LayoutGrid,
  Building
} from 'lucide-react';
import { useDatabase, useRTDBCollection } from '@/firebase';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectSeparator
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/users';
import { academicService } from '@/services/academic';
import { UserProfile, Department, CustomRole } from '@/lib/types';

export default function HRPage() {
  const [activeTab, setActiveTab] = useState('staff');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<UserProfile | null>(null);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: users, loading } = useRTDBCollection<UserProfile>(database, 'users');
  const { data: departments, loading: deptsLoading } = useRTDBCollection<Department>(database, 'departments');
  const { data: roles } = useRTDBCollection<CustomRole>(database, 'roles');

  const staffList = useMemo(() => {
    return users.filter(u => u.role === 'admin' || u.role === 'staff');
  }, [users]);

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => 
      staff.displayName?.toLowerCase().includes(search.toLowerCase()) || 
      staff.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [staffList, search]);

  const stats = useMemo(() => {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const newStaff = staffList.filter(s => (s.createdAt || 0) > thirtyDaysAgo).length;
    const trend = staffList.length > 0 ? `+${((newStaff / staffList.length) * 100).toFixed(1)}%` : '0%';

    return {
      total: staffList.length,
      teachers: staffList.filter(s => s.role === 'staff').length,
      admins: staffList.filter(s => s.role === 'admin').length,
      depts: departments.length,
      trend
    };
  }, [staffList, departments]);

  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const roleSelection = formData.get('role_selection') as string;

    let role = 'staff';
    let customRoleId: string | undefined;

    if (roleSelection.startsWith('base:')) {
      role = roleSelection.split('base:')[1];
    } else if (roleSelection.startsWith('custom:')) {
      role = 'staff'; 
      customRoleId = roleSelection.split('custom:')[1];
    }
    
    const data: Omit<UserProfile, 'id' | 'uid' | 'createdAt'> = {
      displayName: formData.get('name') as string,
      email: formData.get('email') as string,
      role: role as any,
      department: formData.get('dept') as string,
      ...(customRoleId && { customRoleId })
    };

    try {
      await userService.inviteUser(database, data);
      setIsAddOpen(false);
      toast({ title: "Staff Member Added", description: `${data.displayName} registered.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to add staff.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStaff) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const roleSelection = formData.get('role_selection') as string;

    let role = 'staff';
    let customRoleId: string | null = null;

    if (roleSelection.startsWith('base:')) {
      role = roleSelection.split('base:')[1];
    } else if (roleSelection.startsWith('custom:')) {
      role = 'staff'; 
      customRoleId = roleSelection.split('custom:')[1];
    }
    
    // Using any because of the signature mismatch of partial and typescript
    const data: any = {
      displayName: formData.get('name') as string,
      role: role,
      department: (formData.get('dept') as string) || null,
      customRoleId: customRoleId
    };

    try {
      await userService.updateUser(database, editingStaff.uid || editingStaff.id!, data);
      setIsEditOpen(false);
      setEditingStaff(null);
      toast({ title: "Profile Updated", description: "Staff changes saved successfully." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update staff.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDept = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
    };

    try {
      await academicService.addDepartment(database, data);
      setIsDeptOpen(false);
      toast({ title: "Department Registered" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Remove this staff member?')) return;
    try {
      await userService.deleteUser(database, id);
      toast({ title: "Removed", description: "Staff record deleted." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete staff." });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">HR & Staff Management</h2>
            <p className="text-sm text-white/80 mt-1">Institutional workforce, teacher registry and department structures</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" /> RBAC Active
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-4 h-4 text-blue-600" />} label="Workforce" value={loading ? '...' : stats.total.toString()} trend={stats.trend} color="bg-blue-50" />
        <StatCard icon={<Building className="w-4 h-4 text-teal-600" />} label="Departments" value={deptsLoading ? '...' : stats.depts.toString()} trend="Active" color="bg-teal-50" />
        <StatCard icon={<UserCog className="w-4 h-4 text-purple-600" />} label="Administrators" value={loading ? '...' : stats.admins.toString()} trend="Global" color="bg-purple-50" />
        <StatCard icon={<Calendar className="w-4 h-4 text-amber-600" />} label="Registry" value="Sync" trend="Live" color="bg-amber-50" />
      </div>

      <Card className="border-gray-100 overflow-hidden shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex border-b border-gray-100 px-4 bg-gray-50/30">
            <TabsList className="bg-transparent h-auto p-0 gap-4">
              <TabsTrigger value="staff" className="px-4 py-3 text-xs font-bold uppercase border-b-2 border-transparent data-[state=active]:border-rose-600 data-[state=active]:text-rose-600 rounded-none bg-transparent">Staff Registry</TabsTrigger>
              <TabsTrigger value="depts" className="px-4 py-3 text-xs font-bold uppercase border-b-2 border-transparent data-[state=active]:border-rose-600 data-[state=active]:text-rose-600 rounded-none bg-transparent">Departments</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-5">
            <TabsContent value="staff" className="m-0 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input className="pl-9 text-xs h-10" placeholder="Search directory..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-rose-600 hover:bg-rose-700 h-10 text-xs font-bold gap-1.5 px-4"><Plus className="h-3.5 w-3.5" /> Register Staff</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddStaff}>
                      <DialogHeader><DialogTitle>Add New Staff Member</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Label>Full Name</Label>
                        <Input name="name" required />
                        <Label>Email</Label>
                        <Input name="email" type="email" required />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Institutional Role</Label>
                            <Select name="role_selection" defaultValue="base:staff">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="base:admin">Administrator (Full Access)</SelectItem>
                                <SelectItem value="base:staff">Teacher / Staff (Standard)</SelectItem>
                                {roles?.length > 0 && <SelectSeparator />}
                                {roles?.map(r => <SelectItem key={r.id} value={`custom:${r.id}`}>{r.name} (Custom Policy)</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Department</Label>
                            <Select name="dept">
                              <SelectTrigger><SelectValue placeholder="Choose dept..." /></SelectTrigger>
                              <SelectContent>
                                {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full bg-rose-600">Confirm Appointment</Button></DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogContent>
                    <form onSubmit={handleEditStaff}>
                      <DialogHeader><DialogTitle>Edit Staff Profile</DialogTitle></DialogHeader>
                      {editingStaff && (
                        <div className="grid gap-4 py-4">
                          <Label>Full Name</Label>
                          <Input name="name" defaultValue={editingStaff.displayName} required />
                          <Label>Email <span className="text-[10px] text-gray-400 font-normal">(Immutable)</span></Label>
                          <Input name="email" value={editingStaff.email || ''} disabled className="bg-gray-50 text-gray-400 border-gray-100" />
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Institutional Role</Label>
                              <Select name="role_selection" defaultValue={editingStaff.customRoleId ? `custom:${editingStaff.customRoleId}` : `base:${editingStaff.role}`}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="base:admin">Administrator (Full Access)</SelectItem>
                                  <SelectItem value="base:staff">Teacher / Staff (Standard)</SelectItem>
                                  {roles?.length > 0 && <SelectSeparator />}
                                  {roles?.map(r => <SelectItem key={r.id} value={`custom:${r.id}`}>{r.name} (Custom Policy)</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Department</Label>
                              <Select name="dept" defaultValue={editingStaff.department}>
                                <SelectTrigger><SelectValue placeholder="Choose dept..." /></SelectTrigger>
                                <SelectContent>
                                  {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}
                      <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">Save Changes</Button></DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? <div className="p-20 text-center col-span-full">Syncing...</div> : filteredStaff.map((staff) => (
                  <div key={staff.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all group relative bg-white">
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingStaff(staff); setIsEditOpen(true); }} className="p-1.5 text-gray-300 hover:text-blue-600">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDeleteStaff(staff.uid || staff.id!)} className="p-1.5 text-gray-300 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {staff.displayName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 truncate">{staff.displayName}</p>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700">{staff.role}</span>
                      </div>
                    </div>
                    <div className="space-y-2 pt-3 border-t border-gray-50 text-[10px] text-gray-500 font-medium">
                      <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {staff.email}</div>
                      <div className="flex items-center gap-2"><Briefcase className="w-3 h-3" /> {staff.department || 'General'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="depts" className="m-0 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">Department Registry</h3>
                <Dialog open={isDeptOpen} onOpenChange={setIsDeptOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-rose-600 h-9 font-bold gap-1.5"><Plus className="h-3.5 w-3.5" /> Create Department</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddDept}>
                      <DialogHeader><DialogTitle>Define Institutional Department</DialogTitle></DialogHeader>
                      <div className="py-4">
                        <Label>Department Name</Label>
                        <Input name="name" placeholder="e.g. Science & Innovation" required />
                      </div>
                      <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full bg-rose-600">Save Department</Button></DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {deptsLoading ? <div className="p-12 text-center text-xs text-gray-400">Loading...</div> : departments.map(dept => (
                  <div key={dept.id} className="p-4 border rounded-xl bg-white flex items-center justify-between hover:shadow-sm group transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                        <Building className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-800">{dept.name}</p>
                    </div>
                    <button onClick={() => academicService.deleteDepartment(database, dept.id)} className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${color} text-gray-700`}>{label}</span>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
