
"use client"

import { useState, useMemo } from 'react';
import { 
  Download, 
  Plus, 
  Users, 
  Briefcase, 
  Calendar, 
  Award, 
  Search, 
  Mail,
  Loader2,
  Trash2,
  Database,
  ShieldCheck,
  UserCheck,
  UserCog
} from 'lucide-react';
import { useDatabase, useRTDBCollection } from '@/firebase';
import { ref, push, remove, serverTimestamp } from 'firebase/database';
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
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function HRPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: users, loading } = useRTDBCollection(database, 'users');

  const staffList = useMemo(() => {
    return users.filter(u => u.role === 'admin' || u.role === 'staff');
  }, [users]);

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      const matchesSearch = 
        staff.displayName?.toLowerCase().includes(search.toLowerCase()) || 
        staff.email?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [staffList, search]);

  const stats = useMemo(() => {
    return {
      total: staffList.length,
      teachers: staffList.filter(s => s.role === 'staff').length,
      admins: staffList.filter(s => s.role === 'admin').length,
    };
  }, [staffList]);

  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      displayName: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      department: formData.get('dept'),
      createdAt: serverTimestamp()
    };

    try {
      await push(ref(database, 'users'), data);
      setIsAddOpen(false);
      toast({ title: "Staff Member Added", description: `${data.displayName} has been registered.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to add staff.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this staff member? All access will be revoked.')) return;
    await remove(ref(database, `users/${id}`));
    toast({ title: "Removed", description: "Staff record deleted successfully." });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* High-Fidelity Header */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="30" r="80" fill="white" />
            <circle cx="100" cy="180" r="120" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">HR & Staff Management</h2>
            <p className="text-sm text-white/80 mt-1">Manage institutional human resources, teaching staff and payroll access</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" /> RBAC Verified
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-4 h-4 text-blue-600" />} label="Total Workforce" value={loading ? '...' : stats.total.toString()} color="bg-blue-50" />
        <StatCard icon={<UserCheck className="w-4 h-4 text-teal-600" />} label="Teaching Staff" value={loading ? '...' : stats.teachers.toString()} color="bg-teal-50" />
        <StatCard icon={<UserCog className="w-4 h-4 text-purple-600" />} label="Administrators" value={loading ? '...' : stats.admins.toString()} color="bg-purple-50" />
        <StatCard icon={<Calendar className="w-4 h-4 text-amber-600" />} label="Active Sessions" value="Term 1" color="bg-amber-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input 
            className="pl-9 text-xs h-10" 
            placeholder="Search staff directory..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-10 text-xs font-bold gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export Directory
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-rose-600 hover:bg-rose-700 h-10 text-xs font-bold gap-1.5 px-4">
                <Plus className="h-3.5 w-3.5" /> Register Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddStaff}>
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input name="name" placeholder="John Nyathi" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input name="email" type="email" placeholder="john@sunrise.edu" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select name="role" defaultValue="staff">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Staff/Teacher</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input name="dept" placeholder="Science" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-rose-600">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Confirm Appointment
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-2" />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Syncing Staff Directory...</p>
            </div>
          ) : filteredStaff.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((staff) => (
                <StaffCard key={staff.id} staff={staff} onDelete={() => handleDelete(staff.id)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
              <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">No staff members found.</p>
              <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest font-bold">Start by registering teaching or admin personnel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${color} text-gray-700`}>{label}</span>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function StaffCard({ staff, onDelete }: any) {
  const initials = staff.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all group relative bg-white">
      <button onClick={onDelete} className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-600 hover:bg-rose-50 transition-all">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate group-hover:text-rose-600 transition-colors">{staff.displayName || 'Unnamed User'}</p>
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
            staff.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {staff.role}
          </span>
        </div>
      </div>
      <div className="space-y-2 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
          <Mail className="w-3 h-3 text-rose-400" />
          <span className="truncate">{staff.email}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
          <Briefcase className="w-3 h-3 text-rose-400" />
          <span>{staff.department || 'General Administration'}</span>
        </div>
      </div>
    </div>
  );
}
