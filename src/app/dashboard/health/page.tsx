
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
import { useDatabase, useRTDBCollection, useUserProfile } from '@/firebase';
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
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const { data: visits, loading: visitsLoading } = useRTDBCollection<HealthRecord>(database, 'health_records');
  const { data: students, loading: studentsLoading } = useRTDBCollection<Student>(database, 'students');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';
  const isParent = profile?.role === 'parent';

  // Role-based visit filtering
  const filteredVisits = useMemo(() => {
    let baseVisits = visits;

    if (isParent && profile?.email) {
      const myStudentIds = students
        .filter(s => s.parentEmail?.toLowerCase() === profile.email?.toLowerCase())
        .map(s => s.id);
      baseVisits = visits.filter(v => myStudentIds.includes(v.studentId));
    }

    return baseVisits.filter((v: any) =>
      v.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      v.condition?.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [visits, search, isParent, profile?.email, students]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    // Calculate allergies from student registry
    const allergyCount = students.filter(s =>
      s.dietaryRequirements?.toLowerCase().includes('allergy') ||
      s.dietaryRequirements?.toLowerCase().includes('allergic')
    ).length;

    return {
      todayCount: filteredVisits.filter((v: any) => v.date === today).length,
      allergies: allergyCount,
      totalRecords: filteredVisits.length,
      safetyScore: '98.4%'
    };
  }, [students, filteredVisits]);

  const handleLogVisit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!isAdmin) return;
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
      nurse: formData.get('nurse') as string || profile?.displayName || "School Nurse",
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
    if (!isAdmin || !confirm('Delete this health record?')) return;
    try {
      await operationsService.deleteHealthRecord(database, id);
      toast({ title: "Removed", description: "Clinic record deleted." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete record." });
    }
  };

  const loading = visitsLoading || studentsLoading;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {isAdmin ? 'Health & Safety Management' : 'Family Wellness Journal'}
            </h2>
            <p className="text-sm text-white/80 mt-1">
              {isAdmin
                ? 'Institutional health logs, clinical visits, and incident monitoring'
                : 'Track clinic visits and health history for your children.'}
            </p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <Activity className="w-3.5 h-3.5" /> Wellness Engine Active
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthMetricCard icon={<Stethoscope className="h-4.5 w-4.5 text-emerald-600" />} label={isAdmin ? "Today's Visits" : "Child Visits"} value={loading ? '...' : stats.todayCount.toString()} color="bg-emerald-50" trend={isAdmin ? "Current Shift" : "Activity"} />
        <HealthMetricCard icon={<ShieldAlert className="h-4.5 w-4.5 text-rose-600" />} label="Safety Score" value={stats.safetyScore} color="bg-rose-50" trend="Institutional" />
        <HealthMetricCard icon={<TriangleAlert className="h-4.5 w-4.5 text-amber-600" />} label={isAdmin ? "Severe Allergies" : "Active Flags"} value={stats.allergies.toString()} color="bg-amber-50" trend="Critical Awareness" />
        <HealthMetricCard icon={<CalendarCheck className="h-4.5 w-4.5 text-blue-600" />} label="Record Count" value={loading ? '...' : stats.totalRecords.toString()} color="bg-blue-50" trend="Syncing Live" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
            <div>
              <CardTitle className="text-sm font-bold text-gray-800">
                {isAdmin ? 'Clinic Logs & Observations' : 'Family Medical History'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isAdmin ? 'Daily register of student clinic visits' : 'Historical records of clinic visits for your family.'}
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input placeholder="Search logs..." className="pl-8 h-8 text-xs border-gray-200" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {isAdmin && (
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
                        <Input name="condition" placeholder="e.g. Headache, Minor Scrape" required />
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
                            <Label>Nurse / Attendant</Label>
                            <Input name="nurse" defaultValue={profile?.displayName} placeholder="Full Name" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Finalize Record
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-xs text-gray-400 italic">Syncing medical registry...</p>
              </div>
            ) : filteredVisits.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {filteredVisits.map((visit: any) => (
                  <div key={visit.id} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-all group relative">
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(visit.id)}
                        className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 rounded-lg transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-800">{visit.studentName}</p>
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[8px] font-bold text-gray-500 uppercase">{visit.grade}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 font-medium mt-0.5">{visit.condition}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                        <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {visit.date}</span>
                        <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" /> {visit.nurse}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        visit.outcome === 'Sent Home' ? 'bg-amber-100 text-amber-700' :
                        visit.outcome === 'Referred' ? 'bg-rose-100 text-rose-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {visit.outcome || 'Treated'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <HeartPulse className="h-10 w-10 text-gray-100 mx-auto" />
                <p className="text-xs text-gray-400 italic">No health records found.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm bg-gray-50/50 border-dashed">
            <CardContent className="p-6 text-center space-y-2">
              <Syringe className="h-8 w-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">Immunization Register</p>
              <p className="text-[10px] text-gray-400 leading-relaxed">Access global vaccination records and institutional health compliance audits.</p>
              <Button variant="outline" size="sm" className="w-full text-[10px] font-bold h-8 border-gray-200 bg-white">Access Vault</Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="border-amber-100 bg-amber-50/30">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <TriangleAlert className="h-4 w-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-amber-800">Critical Medical Flags</p>
                    <p className="text-[10px] text-amber-700 mt-1 leading-relaxed">
                      Ensure all staff are briefed on students with severe allergies as flagged in the metrics summary.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{trend}</span>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
