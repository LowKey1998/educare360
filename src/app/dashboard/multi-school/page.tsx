
"use client"

import { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Users, 
  GraduationCap, 
  DollarSign, 
  Globe, 
  Eye, 
  Trash2,
  Database,
  Loader2,
  Search,
  MapPin
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
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { operationsService } from '@/services/operations';
import { School } from '@/lib/types';

export default function MultiSchoolPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: schools, loading } = useRTDBCollection<School>(database, 'schools');

  const filteredSchools = useMemo(() => {
    return schools.filter(s => 
      s.name?.toLowerCase().includes(search.toLowerCase()) || 
      s.city?.toLowerCase().includes(search.toLowerCase())
    );
  }, [schools, search]);

  const stats = useMemo(() => {
    const totalEnrollment = schools.reduce((acc, s) => acc + (parseInt(s.enrollment as any) || 0), 0);
    const totalStaff = schools.reduce((acc, s) => acc + (parseInt(s.staff as any) || 0), 0);
    return {
      totalSchools: schools.length,
      totalEnrollment,
      totalStaff,
      avgRatio: totalStaff > 0 ? (totalEnrollment / totalStaff).toFixed(1) : '0.0'
    };
  }, [schools]);

  const handleAddSchool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data: Omit<School, 'id'> = {
      name: formData.get('name') as string,
      city: formData.get('city') as string,
      type: formData.get('type') as any,
      enrollment: parseInt(formData.get('enrollment') as string) || 0,
      staff: parseInt(formData.get('staff') as string) || 0,
      plan: formData.get('plan') as string,
      status: 'Active',
    };

    try {
      await operationsService.registerSchool(database, data);
      setIsAddOpen(false);
      toast({ title: "School Registered", description: `${data.name} added.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to add school.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this school?')) return;
    try {
      await operationsService.deleteSchool(database, id);
      toast({ title: "School Removed", description: "Institutional node deleted." });
    } catch (e) {
      toast({ title: "Error", description: "Delete failed." });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Multi-School Management</h2>
            <p className="text-sm text-white/80 mt-1">Super-admin control for groups of schools and branches</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <Globe className="w-3.5 h-3.5" /> Platform Global
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Building2 className="w-4 h-4 text-blue-600" />} label="Total Schools" value={loading ? '...' : stats.totalSchools.toString()} color="bg-blue-50" />
        <StatCard icon={<Users className="w-4 h-4 text-purple-600" />} label="Total Pupils" value={loading ? '...' : stats.totalEnrollment.toLocaleString()} color="bg-purple-50" />
        <StatCard icon={<GraduationCap className="w-4 h-4 text-teal-600" />} label="Total Staff" value={loading ? '...' : stats.totalStaff.toString()} color="bg-teal-50" />
        <StatCard icon={<DollarSign className="w-4 h-4 text-green-600" />} label="Plan" value="Enterprise" color="bg-green-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 justify-between">
        <Input className="max-w-md h-9 text-xs" placeholder="Search institutions..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 font-bold gap-1.5 shadow-sm"><Plus className="h-3.5 w-3.5" /> Register School</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddSchool}>
              <DialogHeader><DialogTitle>Register New Campus</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <Label>School Name</Label>
                <Input name="name" required />
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>City</Label><Input name="city" required /></div>
                  <div>
                    <Label>Type</Label>
                    <Select name="type" defaultValue="Main Campus">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Main Campus">Main Campus</SelectItem>
                        <SelectItem value="Branch">Branch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Enrollment</Label><Input name="enrollment" type="number" /></div>
                  <div><Label>Staff</Label><Input name="staff" type="number" /></div>
                </div>
              </div>
              <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600">Provision Campus</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? <div className="p-20 text-center text-xs italic">Syncing nodes...</div> : (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold tracking-tighter">
                <th className="px-4 py-3.5">Institution</th>
                <th className="px-4 py-3.5 text-right">Pupils</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSchools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50/50 group transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-800">{school.name}</p>
                    <p className="text-[9px] text-gray-400 flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {school.city}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-700">{school.enrollment}</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold uppercase">{school.status}</span></td>
                  <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(school.id)} className="p-1.5 text-gray-300 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>{icon}</div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
