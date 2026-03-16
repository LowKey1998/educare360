
"use client"

import { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus,
  Download, 
  TrendingUp, 
  Users, 
  GraduationCap, 
  DollarSign, 
  ChartColumn, 
  GitBranch, 
  Globe, 
  Clock, 
  Eye, 
  Trash2,
  Database,
  Loader2,
  TriangleAlert,
  Search,
  MapPin
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

export default function MultiSchoolPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: schools, loading } = useRTDBCollection(database, 'schools');

  const filteredSchools = useMemo(() => {
    return schools.filter(s => 
      s.name?.toLowerCase().includes(search.toLowerCase()) || 
      s.city?.toLowerCase().includes(search.toLowerCase())
    );
  }, [schools, search]);

  const stats = useMemo(() => {
    const totalEnrollment = schools.reduce((acc, s) => acc + (parseInt(s.enrollment) || 0), 0);
    const totalStaff = schools.reduce((acc, s) => acc + (parseInt(s.staff) || 0), 0);
    const activeCount = schools.filter(s => s.status === 'Active').length;
    
    return {
      totalSchools: schools.length,
      activeSchools: activeCount,
      totalEnrollment,
      totalStaff,
      avgRatio: totalStaff > 0 ? (totalEnrollment / totalStaff).toFixed(1) : '0.0'
    };
  }, [schools]);

  const handleAddSchool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      city: formData.get('city'),
      type: formData.get('type'),
      enrollment: parseInt(formData.get('enrollment') as string) || 0,
      staff: parseInt(formData.get('staff') as string) || 0,
      revenue: formData.get('revenue') || '$0',
      plan: formData.get('plan'),
      status: 'Active',
      createdAt: serverTimestamp()
    };

    try {
      await push(ref(database, 'schools'), data);
      setIsAddOpen(false);
      toast({ title: "School Registered", description: `${data.name} has been added to the platform.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to add school.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this school from the platform? All data will be archived.')) return;
    try {
      await remove(ref(database, `schools/${id}`));
      toast({ title: "School Removed", description: "The institution was deleted." });
    } catch (e) {
      toast({ title: "Error", description: "Delete failed." });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* High-Fidelity Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="30" r="80" fill="white" />
            <circle cx="100" cy="180" r="120" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Multi-School Management</h2>
            <p className="text-sm text-white/80 mt-1">Super-admin control for groups of schools and branches</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
              <Globe className="w-3.5 h-3.5" /> Platform Global
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Building2 className="w-4 h-4 text-blue-600" />} label="Total Schools" value={loading ? '...' : stats.totalSchools.toString()} color="bg-blue-50" trend={`${stats.activeSchools} active`} />
        <StatCard icon={<Users className="w-4 h-4 text-purple-600" />} label="Total Pupils" value={loading ? '...' : stats.totalEnrollment.toLocaleString()} color="bg-purple-50" trend="Cross-platform" />
        <StatCard icon={<GraduationCap className="w-4 h-4 text-teal-600" />} label="Total Staff" value={loading ? '...' : stats.totalStaff.toString()} color="bg-teal-50" trend={`${stats.avgRatio} pupils/staff`} />
        <StatCard icon={<DollarSign className="w-4 h-4 text-green-600" />} label="Platform Plan" value="Enterprise" color="bg-green-50" trend="Active Subscription" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto custom-scrollbar">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Global Directory" />
          <TabButton active={activeTab === 'branches'} onClick={() => setActiveTab('branches')} label="Branch Groups" />
          <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} label="Platform Audit" />
        </div>

        <div className="p-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input 
                  className="pl-9 text-xs h-9" 
                  placeholder="Search institutions by name or city..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 text-xs font-bold gap-1.5 shadow-sm">
                    <Plus className="h-3.5 w-3.5" /> Register School
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <form onSubmit={handleAddSchool}>
                    <DialogHeader>
                      <DialogTitle>Add New Institutional Node</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>School Full Name</Label>
                        <Input name="name" placeholder="e.g. Sunrise Academy - Borrowdale" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>City/Location</Label>
                          <Input name="city" placeholder="e.g. Harare" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Campus Type</Label>
                          <Select name="type" defaultValue="Main Campus">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Main Campus">Main Campus</SelectItem>
                              <SelectItem value="Branch">Branch</SelectItem>
                              <SelectItem value="Satellite">Satellite</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Est. Enrollment</Label>
                          <Input name="enrollment" type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label>Staff Count</Label>
                          <Input name="staff" type="number" placeholder="0" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Service Plan</Label>
                        <Select name="plan" defaultValue="Professional">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Starter">Starter</SelectItem>
                            <SelectItem value="Professional">Professional</SelectItem>
                            <SelectItem value="Enterprise">Enterprise</SelectItem>
                            <SelectItem value="Ultimate">Ultimate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Provision Institution
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mapping Global Nodes...</p>
              </div>
            ) : filteredSchools.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-50">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Institution</th>
                      <th className="text-left py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Type</th>
                      <th className="text-right py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Enrollment</th>
                      <th className="text-right py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Staff</th>
                      <th className="text-center py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Plan</th>
                      <th className="text-center py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Status</th>
                      <th className="text-right py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredSchools.map((school: any) => (
                      <tr key={school.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                              {school.name?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{school.name}</p>
                              <div className="flex items-center gap-1 text-[9px] text-gray-400 uppercase font-bold">
                                <MapPin className="w-2.5 h-2.5" /> {school.city}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-bold uppercase">
                            {school.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-700">
                          {school.enrollment?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-500">
                          {school.staff}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase">
                            {school.plan}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-tighter shadow-sm">
                            {school.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-blue-600 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleDelete(school.id)} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-rose-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                <Building2 className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">No registered institutions.</p>
                <p className="text-xs text-gray-300 mt-1">Start by provisioning a new school node.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, trend }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>{icon}</div>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{trend}</span>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{label}</p>
    </div>
  );
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-3 text-xs font-bold uppercase tracking-tighter border-b-2 transition-colors whitespace-nowrap ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
      {label}
    </button>
  );
}
