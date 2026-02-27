
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
  Trash2
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
    if (!confirm('Remove this staff member?')) return;
    await remove(ref(database, `users/${id}`));
    toast({ title: "Removed", description: "Staff record deleted." });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">HR & Staff Management</h2>
          <p className="text-xs text-gray-500">Manage institutional staff and performance records</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-rose-600 hover:bg-rose-700 gap-1.5 h-9">
                <Plus className="w-3.5 h-3.5" /> Add Staff
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
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Staff"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-4 h-4 text-blue-600" />} label="Total Staff" value={loading ? '...' : stats.total.toString()} color="bg-blue-50" />
        <StatCard icon={<Briefcase className="w-4 h-4 text-teal-600" />} label="Teachers" value={loading ? '...' : stats.teachers.toString()} color="bg-teal-50" />
        <StatCard icon={<Award className="w-4 h-4 text-purple-600" />} label="Admins" value={loading ? '...' : stats.admins.toString()} color="bg-purple-50" />
        <StatCard icon={<Calendar className="w-4 h-4 text-amber-600" />} label="Active" value={loading ? '...' : stats.total.toString()} color="bg-amber-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search staff..." 
                className="w-full max-w-md pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-rose-300" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-2" />
                <p className="text-xs text-gray-400 italic">Syncing directory...</p>
              </div>
            ) : filteredStaff.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredStaff.map((staff) => (
                  <StaffCard key={staff.id} staff={staff} onDelete={() => handleDelete(staff.id)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 italic text-xs">No records.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

function StaffCard({ staff, onDelete }: any) {
  const initials = staff.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all group relative">
      <button onClick={onDelete} className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-rose-600 transition-colors">{staff.displayName || 'Unnamed'}</p>
          <p className="text-[10px] text-gray-500 capitalize">{staff.role}</p>
        </div>
      </div>
      <div className="space-y-1 text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {staff.email}</div>
        <div className="flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> {staff.department || 'Academic'}</div>
      </div>
    </div>
  );
}
