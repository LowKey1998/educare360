
"use client"

import { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Users, 
  GraduationCap, 
  DollarSign, 
  Globe, 
  Trash2,
  Database,
  Loader2,
  MapPin,
  TrendingUp
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

  const stats = useMemo(() => {
    const totalEnrollment = schools.reduce((acc, s) => acc + (parseInt(s.enrollment as any) || 0), 0);
    const totalStaff = schools.reduce((acc, s) => acc + (parseInt(s.staff as any) || 0), 0);
    
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const newSchools = schools.filter(s => (s.createdAt || 0) > thirtyDaysAgo).length;
    const trend = schools.length > 0 ? `+${((newSchools / schools.length) * 100).toFixed(1)}%` : '0%';

    return {
      totalSchools: schools.length,
      totalEnrollment,
      totalStaff,
      trend
    };
  }, [schools]);

  const filteredSchools = useMemo(() => {
    return schools.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));
  }, [schools, search]);

  const handleAddSchool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get('name'),
      city: formData.get('city'),
      type: formData.get('type'),
      enrollment: parseInt(formData.get('enrollment') as string) || 0,
      staff: parseInt(formData.get('staff') as string) || 0,
      status: 'Active',
    };

    try {
      await operationsService.registerSchool(database, data);
      setIsAddOpen(false);
      toast({ title: "School Registered" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
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
            <p className="text-sm text-white/80 mt-1">Super-admin platform overview across all institutional nodes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Building2 className="w-4 h-4 text-blue-600" />} label="Total Schools" value={loading ? '...' : stats.totalSchools.toString()} trend={stats.trend} color="bg-blue-50" />
        <StatCard icon={<Users className="w-4 h-4 text-purple-600" />} label="Global Enrolment" value={loading ? '...' : stats.totalEnrollment.toLocaleString()} trend="Institutional" color="bg-purple-50" />
        <StatCard icon={<GraduationCap className="w-4 h-4 text-teal-600" />} label="Global Workforce" value={loading ? '...' : stats.totalStaff.toString()} trend="Platform Wide" color="bg-teal-50" />
        <StatCard icon={<DollarSign className="w-4 h-4 text-green-600" />} label="Platform Tier" value="Enterprise" trend="Active" color="bg-green-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 justify-between">
        <Input className="max-w-md h-9 text-xs" placeholder="Search institutions..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 font-bold gap-1.5"><Plus className="h-3.5 w-3.5" /> Register School</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddSchool}>
              <DialogHeader><DialogTitle>Provision New Campus</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <Input name="name" placeholder="School Name" required />
                <Input name="city" placeholder="City" required />
                <Input name="enrollment" type="number" placeholder="Est. Enrollment" />
              </div>
              <DialogFooter><Button type="submit" disabled={isSubmitting}>Confirm</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? <div className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div> : (
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3 text-right">Pupils</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSchools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-800">{school.name}</p>
                    <p className="text-[9px] text-gray-400 flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {school.city}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-700">{school.enrollment}</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold uppercase">{school.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => operationsService.deleteSchool(database, school.id)} className="p-1.5 text-gray-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
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

function StatCard({ icon, label, value, trend, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shadow-sm`}>{icon}</div>
        {trend && <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> {trend}</span>}
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{label}</p>
    </div>
  );
}
