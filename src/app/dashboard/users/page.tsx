
"use client"

import { useState, useMemo } from 'react';
import { 
  Shield, 
  Search, 
  UserCircle, 
  Trash2, 
  Loader2,
  Mail,
  Calendar,
  Plus,
  Database,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Edit
} from 'lucide-react';
import { useDatabase, useRTDBCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
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
import { userService } from '@/services/users';
import { UserProfile, CustomRole } from '@/lib/types';

export default function UsersRBACPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: users, loading } = useRTDBCollection<UserProfile>(database, 'users');
  const { data: roles } = useRTDBCollection<CustomRole>(database, 'roles');

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const stats = useMemo(() => {
    return {
      admins: users.filter(u => u.role === 'admin').length,
      staff: users.filter(u => u.role === 'staff').length,
      parents: users.filter(u => u.role === 'parent').length,
    };
  }, [users]);

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const roleSelection = formData.get('role_selection') as string;

    let role = 'staff';
    let customRoleId: string | undefined;

    if (roleSelection.startsWith('base:')) {
      role = roleSelection.split('base:')[1];
    } else if (roleSelection.startsWith('custom:')) {
      role = 'staff'; 
      customRoleId = roleSelection.split('custom:')[1];
    }

    const data = {
      displayName: formData.get('name') as string,
      email: email,
      role: role as any,
      ...(customRoleId && { customRoleId }),
    };

    const password = formData.get('password') as string;

    try {
      if (password) {
        await userService.createStaffAccount(database, data, password);
        setIsAddOpen(false);
        toast({ title: "Account Created", description: `${data.displayName} has been fully registered.` });
      } else {
        await userService.inviteUser(database, data);
        setIsAddOpen(false);
        toast({ title: "Invitation Sent", description: `${data.displayName} has been sent an invitation.` });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to add user account.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
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
    
    const data: any = {
      displayName: formData.get('name') as string,
      role: role,
      customRoleId: customRoleId
    };

    try {
      await userService.updateUser(database, editingUser.uid || editingUser.id!, data);
      setIsEditOpen(false);
      setEditingUser(null);
      toast({ title: "Profile Updated", description: "User permissions rebuilt." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update user.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to revoke this user\'s institutional access?')) return;
    try {
      await userService.deleteUser(database, uid);
      toast({ title: "Access Revoked" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to remove user account.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-[#1E3A5F] via-indigo-600 to-indigo-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="30" r="80" fill="white" />
            <circle cx="100" cy="180" r="120" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Identity & Access Control</h2>
            <p className="text-sm text-white/80 mt-1">Manage institutional roles, permissions, and platform users</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3.5 h-3.5" /> RBAC Active
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <RBACStat icon={<ShieldCheck className="w-4 h-4 text-rose-600" />} label="Administrators" value={loading ? '...' : stats.admins.toString()} color="bg-rose-50" />
        <RBACStat icon={<UserCircle className="w-4 h-4 text-blue-600" />} label="Staff Users" value={loading ? '...' : stats.staff.toString()} color="bg-blue-50" />
        <RBACStat icon={<UserPlus className="w-4 h-4 text-emerald-600" />} label="Parent Users" value={loading ? '...' : stats.parents.toString()} color="bg-emerald-50" />
        <RBACStat icon={<ShieldAlert className="w-4 h-4 text-amber-600" />} label="Total Registered" value={loading ? '...' : users.length.toString()} color="bg-amber-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search directory by name, email or role..." 
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 bg-white" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 h-9 text-xs font-bold gap-1.5 shadow-sm px-4">
              <Plus className="h-3.5 w-3.5" /> Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddUser}>
              <DialogHeader>
                <DialogTitle>Register Platform Account</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input name="name" placeholder="Institutional User" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input name="email" type="email" placeholder="user@school.edu" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Temporary Password <span className="text-[10px] font-normal text-gray-400">(Optional)</span></Label>
                    <Input name="password" type="text" placeholder="Leave blank for invite" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Assign Institutional Role</Label>
                  <Select name="role_selection" defaultValue="base:staff">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base:admin">Administrator (Full Access)</SelectItem>
                      <SelectItem value="base:staff">Staff/Teacher (Standard)</SelectItem>
                      <SelectItem value="base:parent">Parent Portal User</SelectItem>
                      {roles?.length > 0 && <SelectSeparator />}
                      {roles?.map(r => (
                        <SelectItem key={r.id} value={`custom:${r.id}`}>
                          {r.name} (Custom Policy)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Registration
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <form onSubmit={handleEditUser}>
              <DialogHeader>
                <DialogTitle>Edit Platform Account</DialogTitle>
              </DialogHeader>
              {editingUser && (
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input name="name" defaultValue={editingUser.displayName} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email <span className="text-[10px] text-gray-400 font-normal">(Immutable)</span></Label>
                    <Input name="email" value={editingUser.email || ''} disabled className="bg-gray-50 text-gray-400 border-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Institutional Role</Label>
                    <Select name="role_selection" defaultValue={editingUser.customRoleId ? `custom:${editingUser.customRoleId}` : `base:${editingUser.role}`}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base:admin">Administrator (Full Access)</SelectItem>
                        <SelectItem value="base:staff">Staff/Teacher (Standard)</SelectItem>
                        <SelectItem value="base:parent">Parent Portal User</SelectItem>
                        {roles?.length > 0 && <SelectSeparator />}
                        {roles?.map(r => (
                          <SelectItem key={r.id} value={`custom:${r.id}`}>
                            {r.name} (Custom Policy)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Verifying Identity Cloud...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <th className="px-6 py-4">User Identity</th>
                  <th className="px-6 py-4">Access Level</th>
                  <th className="px-6 py-4 text-center">Registration</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-inner">
                          {user.displayName?.split(' ').map((n: string) => n[0]).join('') || '??'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 leading-tight">{user.displayName || 'No Name'}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                            <Mail className="w-2.5 h-2.5" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-2.5 py-1 w-fit rounded-lg text-[9px] font-bold uppercase tracking-wide border shadow-sm ${
                          user.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                          user.role === 'staff' ? 'bg-teal-50 text-teal-600 border-teal-100' : 
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {user.role}
                        </span>
                        {user.customRoleId && (
                          <span className="px-2 py-0.5 w-fit bg-purple-50 text-purple-600 border border-purple-100 rounded text-[9px] font-bold uppercase">
                            {roles?.find(r => r.id === user.customRoleId)?.name || 'Custom Policy'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        <Calendar className="w-3 h-3 text-gray-300" />
                        {new Date(user.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingUser(user); setIsEditOpen(true); }} className="p-2 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteUser(user.uid || user.id!)} className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-gray-400 italic text-xs">
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}

function RBACStat({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>{icon}</div>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active</span>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{label}</p>
    </div>
  );
}
