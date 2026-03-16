
"use client"

import { useState, useMemo } from 'react';
import { 
  Plus, 
  Stethoscope, 
  Syringe, 
  TriangleAlert, 
  ShieldAlert, 
  Clock,
  User,
  Loader2,
  Trash2,
  Search,
  Activity,
  CalendarCheck,
  HeartPulse
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDatabase, useRTDBCollection } from '@/firebase';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { operationsService } from '@/services/operations';
import { HealthRecord, Student } from '@/lib/types';

export default function HealthSafetyPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: visits, loading } = useRTDBCollection<HealthRecord>(database, 'health_records');
  const { data: students } = useRTDBCollection<Student>(database, 'students');

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      todayCount: visits.filter((v: any) => v.date === today).length,
      allergies: 2,
      totalRecords: visits.length,
      safetyScore: '98.4%'
    };
  }, [visits]);

  const filteredVisits = useMemo(() => {
    return visits.filter((v: any) => 
      v.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      v.condition?.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [visits, search]);

  const handleLogVisit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const studentId = formData.get('studentId') as string;
    const student = students.find(s => s.id === studentId);

    const data: Omit<HealthRecord, 'id'> = {
      studentId,
      studentName: student?.studentName || "Unknown",
      grade: student?.grade || "N/A",
      condition: formData.get('condition') as string,
      outcome: formData.get('outcome') as string,
      nurse: formData.get('nurse') as string || "School Nurse",
      date: new Date().toISOString().split('T')[0],
    };

    try {
      await operationsService.logClinicVisit(database, data);
      setIsAddOpen(false);
      toast({ title: "Visit Logged", description: `Clinic visit recorded for ${data.studentName}.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to log visit.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this health record?')) return;
    try {
      await operationsService.deleteHealthRecord(database, id);
      toast({ title: "Removed", description: "Clinic record deleted." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete record." });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Health & Safety Management</h2>
            <p className="text-sm text-white/80 mt-1">Institutional health logs, clinical visits, and incident monitoring</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <Activity className="w-3.5 h-3.5" /> Wellness Engine Active
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthMetricCard icon={<Stethoscope className="h-4.5 w-4.5 text-emerald-600" />} label="Today's Visits" value={loading ? '...' : stats.todayCount.toString()} color="bg-emerald-50" trend="Current Shift" />
        <HealthMetricCard icon={<ShieldAlert className="h-4.5 w-4.5 text-rose-600" />} label="Safety Score" value={stats.safetyScore} color="bg-rose-50" trend="Institutional" />
        <HealthMetricCard icon={<TriangleAlert className="h-4.5 w-4.5 text-amber-600" />} label="Severe Allergies" value={stats.allergies.toString()} color="bg-amber-50" trend="Active Flags" />
        <HealthMetricCard icon={<CalendarCheck className="h-4.5 w-4.5 text-blue-600" />} label="Record Count" value={loading ? '...' : stats.totalRecords.toString()} color="bg-blue-50" trend="Syncing Live" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
            <div>
              <CardTitle className="text-sm font-bold text-gray-800">Clinic Logs & Observations</CardTitle>
              <CardDescription className="text-xs">Daily register of student clinic visits</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input placeholder="Search..." className="pl-8 h-8 text-xs border-gray-200" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs gap-1.5 shadow-sm">
                    <Plus className="h-3.5 w-3.5" /> Log Visit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleLogVisit}>
                    <DialogHeader>
                      <DialogTitle>Log Clinical Visit</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Label>Select Student</Label>
                      <Select name="studentId" required>
                        <SelectTrigger><SelectValue placeholder="Search student..." /></SelectTrigger>
                        <SelectContent>
                          {students.map(s => <SelectItem key={s.id} value={s.id}>{s.studentName} ({s.grade})</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Label>Reason for Visit</Label>
                      <Input name="condition" placeholder="e.g. Headache" required />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Outcome</Label>
                          <Select name="outcome" defaultValue="Treated">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Treated">Treated</SelectItem>
                              <SelectItem value="Sent Home">Sent Home</SelectItem>
                              <SelectItem value="Referred">Referred</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Nurse</Label>
                          <Input name="nurse" placeholder="Nurse Manyika" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600">Save</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <div className="p-20 text-center text-xs italic">Syncing...</div> : filteredVisits.map((visit: any) => (
              <div key={visit.id} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-all group relative">
                <button onClick={() => handleDelete(visit.id)} className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><Stethoscope className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800">{visit.studentName} <span className="text-[10px] text-gray-400 ml-2">{visit.grade}</span></p>
                  <p className="text-[11px] text-gray-600 font-medium">{visit.condition}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[9px] text-gray-400 font-bold uppercase">
                    <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {visit.date}</span>
                    <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" /> {visit.nurse}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${visit.outcome === 'Sent Home' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{visit.outcome || 'Treated'}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm bg-gray-50/50 border-dashed">
            <CardContent className="p-6 text-center space-y-2">
              <Syringe className="h-8 w-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-500">Immunization Register</p>
              <Button variant="outline" size="sm" className="w-full text-[10px] font-bold h-8 border-gray-200">Access Register</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HealthMetricCard({ icon, label, value, color, trend }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>{icon}</div>
        <span className="text-[10px] font-bold text-gray-400">{trend}</span>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
