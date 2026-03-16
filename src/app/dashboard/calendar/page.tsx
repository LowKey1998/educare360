
"use client"

import { useState, useMemo, useEffect } from 'react';
import { 
  Download, 
  Plus, 
  BookOpen, 
  FileText, 
  Calendar as CalendarIcon, 
  Users, 
  MapPin, 
  X, 
  Database,
  Loader2,
  Clock,
  Baby
} from 'lucide-react';
import { useDatabase, useRTDBCollection, useUserProfile } from '@/firebase';
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
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SUBJECTS: Record<string, { color: string }> = {
  'Mathematics': { color: 'bg-blue-100 text-blue-700 border-blue-200' },
  'English': { color: 'bg-purple-100 text-purple-700 border-purple-200' },
  'Shona': { color: 'bg-amber-100 text-amber-700 border-amber-200' },
  'Science': { color: 'bg-green-100 text-green-700 border-green-200' },
  'Social Studies': { color: 'bg-rose-100 text-rose-700 border-rose-200' },
  'ICT': { color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  { label: 'Period 1', time: '07:30 - 08:10' },
  { label: 'Period 2', time: '08:10 - 08:50' },
  { label: 'Period 3', time: '08:50 - 09:30' },
  { label: 'Period 4', time: '10:00 - 10:40' },
  { label: 'Period 5', time: '10:40 - 11:20' },
];

const DEFAULT_GRADES = ['Grade 1A', 'Grade 1B', 'Grade 2A', 'Grade 2B', 'Grade 3A', 'Grade 3B', 'Grade 4A', 'Grade 4B', 'Grade 5A', 'Grade 5B', 'Grade 6A', 'Grade 6B', 'Grade 7A', 'Grade 7B'];

export default function TimetableCalendarPage() {
  const [activeTab, setActiveTab] = useState('timetable');
  const [activeGrade, setActiveGrade] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const database = useDatabase();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  
  const { data: timetable, loading } = useRTDBCollection(database, 'timetable');
  const { data: students } = useRTDBCollection(database, 'students');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';
  const isParent = profile?.role === 'parent';

  // Filter students linked to parent
  const myChildren = useMemo(() => {
    if (!isParent || !profile?.email) return [];
    return students.filter(s => s.parentEmail?.toLowerCase() === profile.email?.toLowerCase());
  }, [students, profile?.email, isParent]);

  // Determine which grades should be available in the selector
  const availableGrades = useMemo(() => {
    if (isAdmin) return DEFAULT_GRADES;
    // For parents, collect grades of their children
    const childGrades = Array.from(new Set(myChildren.map(c => c.grade)));
    return childGrades.length > 0 ? childGrades : [];
  }, [isAdmin, myChildren]);

  // Auto-select first available grade for parent
  useEffect(() => {
    if (!activeGrade && availableGrades.length > 0) {
      setActiveGrade(availableGrades[0]);
    }
  }, [availableGrades, activeGrade]);

  const filteredLessons = useMemo(() => {
    return timetable.filter((l: any) => l.grade === activeGrade);
  }, [timetable, activeGrade]);

  const handleAddLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      grade: activeGrade,
      subject: formData.get('subject'),
      teacher: formData.get('teacher'),
      room: formData.get('room'),
      day: formData.get('day'),
      period: formData.get('period'),
      createdAt: serverTimestamp()
    };

    try {
      await push(ref(database, 'timetable'), data);
      setIsAddOpen(false);
      toast({ title: "Lesson Scheduled", description: `${data.subject} added to ${activeGrade} timetable.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to schedule lesson.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Cancel this lesson?')) return;
    try {
      await remove(ref(database, `timetable/${id}`));
      toast({ title: "Lesson Cancelled", description: "Removed from schedule." });
    } catch (e) {
      toast({ title: "Error", description: "Delete failed." });
    }
  };

  if (isParent && myChildren.length === 0 && !loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">No Timetable Linked</h2>
        <p className="text-xs text-gray-500">We couldn't find any students associated with your account to show a timetable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* High-Fidelity Header */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="30" r="80" fill="white" />
            <circle cx="50" cy="180" r="100" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{isParent ? 'Student Timetable' : 'Timetable & Academic Calendar'}</h2>
            <p className="text-sm text-white/80 mt-1">
              {isParent ? 'View weekly lesson schedules for your family' : 'Class schedules, exam slots, and institutional events'}
            </p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3.5 h-3.5" /> Live Sync Active
            </div>
          </div>
        </div>
      </div>

      {!isParent && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<BookOpen className="w-4 h-4 text-violet-600" />} label="Lessons Logged" value={loading ? '...' : timetable.length.toString()} color="bg-violet-50" />
          <StatCard icon={<FileText className="w-4 h-4 text-red-600" />} label="Upcoming Exams" value="10" color="bg-red-50" />
          <StatCard icon={<CalendarIcon className="w-4 h-4 text-blue-600" />} label="Session Phase" value="Term 1" color="bg-blue-50" />
          <StatCard icon={<Users className="w-4 h-4 text-teal-600" />} label="Classes Configured" value="14" color="bg-teal-50" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto custom-scrollbar">
          <TabButton active={activeTab === 'timetable'} onClick={() => setActiveTab('timetable')} label="Weekly Timetable" />
          <TabButton active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} label="Exam Schedule" />
          <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} label="Institutional Events" />
        </div>

        <div className="p-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select value={activeGrade} onValueChange={setActiveGrade}>
                  <SelectTrigger className="w-[180px] h-9 text-xs font-bold bg-white">
                    <div className="flex items-center gap-2">
                      {isParent ? <Baby className="w-3 h-3 text-rose-500" /> : <Users className="w-3 h-3 text-blue-500" />}
                      <SelectValue placeholder="Select Class" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableGrades.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hidden lg:block">
                  {isParent ? 'Showing child class schedule' : 'Drafting Terminal Schedule'}
                </span>
              </div>
              
              {isAdmin && (
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-9 text-xs font-bold gap-1.5 shadow-sm">
                      <Plus className="h-3.5 w-3.5" /> Add Lesson
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddLesson}>
                      <DialogHeader>
                        <DialogTitle>Schedule Lesson slot</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Subject</Label>
                            <Select name="subject" defaultValue="Mathematics">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {Object.keys(SUBJECTS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Teacher</Label>
                            <Input name="teacher" placeholder="e.g. Mr. Nyathi" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Day</Label>
                            <Select name="day" defaultValue="Monday">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Period</Label>
                            <Select name="period" defaultValue="Period 1">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {PERIODS.map(p => <SelectItem key={p.label} value={p.label}>{p.label} ({p.time})</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Room/Location</Label>
                          <Input name="room" placeholder="e.g. Room 3A" required />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Finalize Slot
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-[120px_repeat(5,1fr)] gap-px bg-gray-100">
                  <div className="bg-gray-50 p-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Time / Day</div>
                  {DAYS.map(day => (
                    <div key={day} className="bg-gray-50 p-3 text-[10px] font-bold text-gray-700 uppercase tracking-widest text-center">{day}</div>
                  ))}

                  {PERIODS.map((period, pIdx) => (
                    <div key={period.label} className="contents">
                      <div className="bg-white p-3 text-center border-r border-gray-100">
                        <p className="text-[10px] font-bold text-gray-800">{period.label}</p>
                        <p className="text-[9px] text-gray-400 font-medium">{period.time}</p>
                      </div>
                      {DAYS.map(day => {
                        const lesson = filteredLessons.find(l => l.day === day && l.period === period.label);
                        if (!lesson) return <div key={day} className="bg-white p-1 min-h-[80px]" />;
                        
                        const config = SUBJECTS[lesson.subject] || { color: 'bg-gray-100 text-gray-700 border-gray-200' };
                        
                        return (
                          <div key={day} className="bg-white p-1 min-h-[80px]">
                            <div className={`h-full rounded-lg border p-2 relative group hover:shadow-md transition-all ${config.color}`}>
                              {isAdmin && (
                                <button onClick={() => handleDelete(lesson.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/50 transition-opacity">
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                              <p className="text-[10px] font-bold leading-tight">{lesson.subject}</p>
                              <p className="text-[9px] opacity-80 mt-0.5">{lesson.teacher}</p>
                              <div className="flex items-center gap-1 text-[8px] opacity-60 mt-1.5">
                                <MapPin className="w-2.5 h-2.5" /> {lesson.room}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>{icon}</div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Status</span>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{label}</p>
    </div>
  );
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-3 text-xs font-bold uppercase tracking-tighter border-b-2 transition-colors whitespace-nowrap ${active ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
      {label}
    </button>
  );
}
