"use client"

import { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Trash2, 
  Loader2,
  Plus,
  Edit,
  Database,
  CheckCircle2,
  Shield
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
import { Checkbox } from '@/components/ui/checkbox';
import { rolesService } from '@/services/roles';
import { CustomRole } from '@/lib/types';

const AVAILABLE_MODULES = [
  { id: '/dashboard/multi-school', label: 'Multi-School Mgmt', group: 'Platform' },
  { id: '/dashboard/users', label: 'Users & RBAC', group: 'Platform' },
  { id: '/dashboard/admissions', label: 'Admissions', group: 'People' },
  { id: '/dashboard/students', label: 'Pupil Management', group: 'People' },
  { id: '/dashboard/hr', label: 'HR & Staff', group: 'People' },
  { id: '/dashboard/roles', label: 'Roles API', group: 'People' },
  { id: '/dashboard/ecd', label: 'ECD Development', group: 'Academic' },
  { id: '/dashboard/academic', label: 'Academic Mgmt', group: 'Academic' },
  { id: '/dashboard/classroom', label: 'Classroom Mgmt', group: 'Academic' },
  { id: '/dashboard/library', label: 'Digital Library', group: 'Academic' },
  { id: '/dashboard/attendance', label: 'Attendance', group: 'Academic' },
  { id: '/dashboard/calendar', label: 'Timetable & Calendar', group: 'Academic' },
  { id: '/dashboard/finance', label: 'Finance & Billing', group: 'Operations' },
  { id: '/dashboard/transport', label: 'Transport', group: 'Operations' },
  { id: '/dashboard/catering', label: 'Meals & Catering', group: 'Operations' },
  { id: '/dashboard/health', label: 'Health & Safety', group: 'Operations' },
  { id: '/dashboard/inventory', label: 'Inventory & Assets', group: 'Operations' },
  { id: '/dashboard/communication', label: 'Communication', group: 'Intelligence' },
  { id: '/dashboard/analytics', label: 'Analytics & Reports', group: 'Intelligence' },
  { id: '/dashboard/documents', label: 'Document Builder', group: 'Intelligence' },
  { id: '/dashboard/ai', label: 'AI & Automation', group: 'Intelligence' },
  { id: '/dashboard/integrations', label: 'Integrations', group: 'System' },
  { id: '/dashboard/settings', label: 'System Admin', group: 'System' },
];

export default function RolesManagementPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);

  const database = useDatabase();
  const { toast } = useToast();
  const { data: roles, loading } = useRTDBCollection<CustomRole>(database, 'roles');

  const filteredRoles = useMemo(() => {
    return roles.filter(r => 
      r.name?.toLowerCase().includes(search.toLowerCase()) || 
      r.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [roles, search]);

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleOpenAdd = () => {
    setEditingRole(null);
    setSelectedPermissions([]);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (role: CustomRole) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions || []);
    setIsAddOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
      if (editingRole) {
        await rolesService.updateRole(database, editingRole.id, {
          name,
          description,
          permissions: selectedPermissions
        });
        toast({ title: "Role Updated", description: `${name} has been updated.` });
      } else {
        await rolesService.addRole(database, {
          name,
          description,
          permissions: selectedPermissions
        });
        toast({ title: "Role Created", description: `${name} role has been added.` });
      }
      setIsAddOpen(false);
    } catch (e) {
      toast({ title: "Error", description: "Failed to save role.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom role? Users assigned to this role will fallback to their base permissions.')) return;
    try {
      await rolesService.deleteRole(database, id);
      toast({ title: "Role Deleted" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete role.", variant: "destructive" });
    }
  };

  // Group modules for UI
  const groupedModules = useMemo(() => {
    return AVAILABLE_MODULES.reduce((acc, module) => {
      if (!acc[module.group]) acc[module.group] = [];
      acc[module.group].push(module);
      return acc;
    }, {} as Record<string, typeof AVAILABLE_MODULES>);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Roles & Permissions Manager</h2>
            <p className="text-sm text-white/80 mt-1">Define custom roles and strictly control module access within the platform</p>
          </div>
          <div className="ml-auto flex items-center gap-3 hidden sm:flex">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3.5 h-3.5" /> Policy Enforced
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search roles..." 
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-purple-500 bg-white" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAdd} className="bg-purple-700 hover:bg-purple-800 h-9 text-xs font-bold gap-1.5 shadow-sm px-4">
              <Plus className="h-3.5 w-3.5" /> Create Custom Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
            <form onSubmit={handleSaveRole} className="flex flex-col h-full">
              <DialogHeader>
                <DialogTitle>{editingRole ? 'Edit Role Policy' : 'Create Custom Role Policy'}</DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700">Role Name</Label>
                    <Input name="name" defaultValue={editingRole?.name} placeholder="e.g. Finance Clerk" required className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700">Description</Label>
                    <Input name="description" defaultValue={editingRole?.description} placeholder="e.g. Manages billing only" className="bg-gray-50 border-gray-200" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-1">Module Access Control</h3>
                    <p className="text-[11px] text-gray-500">Select which sidebar modules users with this role can view and interact with.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {Object.entries(groupedModules).map(([groupName, modules]) => (
                      <div key={groupName} className="space-y-3 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                        <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest border-b border-gray-100 pb-2">
                          {groupName} Group
                        </div>
                        <div className="space-y-2.5">
                          {modules.map(module => (
                            <label key={module.id} className="flex items-center gap-3 cursor-pointer group">
                              <div className="flex items-center justify-center relative">
                                <Checkbox 
                                  checked={selectedPermissions.includes(module.id)}
                                  onCheckedChange={() => togglePermission(module.id)}
                                  className="border-gray-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 h-4 w-4"
                                />
                              </div>
                              <span className="text-xs text-gray-700 font-medium group-hover:text-purple-700 transition-colors">
                                {module.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 pt-4 border-t border-gray-100 flex-shrink-0">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="h-9 text-xs">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-purple-700 hover:bg-purple-800 h-9 text-xs font-bold min-w-[120px]">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                  {editingRole ? 'Update Policy' : 'Enforce Policy'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Fetching Policies...</p>
          </div>
        ) : filteredRoles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Role Define</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center">Permissions Configured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRoles.map((role: CustomRole) => (
                  <tr key={role.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs shadow-inner">
                          {role.name?.[0]?.toUpperCase() || 'R'}
                        </div>
                        <p className="text-xs font-bold text-gray-800 leading-tight">{role.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500">{role.description || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {(role.permissions || []).length} Modules
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleOpenEdit(role)} 
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRole(role.id)} 
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
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
          <div className="p-20 text-center text-gray-400">
            <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-xs font-medium">No custom roles defined yet.</p>
            <p className="text-[10px] mt-1">Create one to get started with precise RBAC.</p>
          </div>
        )}
      </div>
    </div>
  );
}
