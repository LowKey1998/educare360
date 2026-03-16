
"use client"

import { useState, useMemo, useEffect } from 'react';
import { 
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
  Trash2,
  Timer
} from 'lucide-react';
import { useDatabase, useRTDBCollection, useUserProfile } from '@/firebase';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { academicService } from '@/services/academic';
import { Lesson, Exam, Student, UserProfile, Classroom, PeriodStructure, Subject } from '@/lib/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetableCalendarPage() {
  const [activeTab, setActiveTab] = useState('timetable');
  const [activeGrade, setActiveGrade] = useState('');
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isAddPeriodOpen, setIsAddPeriodOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('manual');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const database = useDatabase();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  
  const { data: timetable, loading: ttLoading } = useRTDBCollection<Lesson>(database, 'timetable');
  const { data: exams, loading: examsLoading } = useRTDBCollection<Exam>(database, 'exams');
  const { data: periods, loading: periodsLoading } = useRTDBCollection<PeriodStructure>(database, 'period_structures');
  const { data: users } = useRTDBCollection<UserProfile>(database, 'users');
  const { data: classrooms } = useRTDBCollection<Classroom>(database, 'classrooms');
  const { data: subjects } = useRTDBCollection<Subject>(database, 'subjects');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';
  const teachers = useMemo(() => users.filter(u => u.role === 'staff' || u.role === 'admin'), [users]);

  const availableGrades = useMemo(() => {
    const grades = new Set<string>();
    classrooms.forEach(c => grades.add(c.name));
    timetable.forEach(l => grades.add(l.grade));
    return Array.from(grades).sort();
  }, [classrooms, timetable]);

  useEffect(() => {
    if (!activeGrade && availableGrades.length > 0) setActiveGrade(availableGrades[0]);
  }, [availableGrades, activeGrade]);

  const handlePeriodSelect = (periodId: string) => {
    setSelectedPeriodId(periodId);
    if (periodId !== 'manual') {
      const p = periods.find(p => p.id === periodId);
      if (p) { setStartTime(p.startTime); setEndTime(p.endTime); }
    }
  };

  const handleAddLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const teacherId = formData.get('teacherId') as string;
    const teacher = teachers.find(t => t.uid === teacherId);
    
    const data: any = {
      grade: activeGrade,
      subject: formData.get('subject'),
      teacherId,
      teacherName: teacher?.displayName || 'Unknown',
      room: formData.get('room'),
      day: formData.get('day'),
      period: formData.get('period'),
      startTime,
      endTime,
    };

    try {
      await academicService.scheduleLesson(database, data);
      setIsAddLessonOpen(false);
      toast({ title: "Lesson Scheduled" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPeriod = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get('name'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
    };

    try {
      await academicService.addPeriodStructure(database, data);
      setIsAddPeriodOpen(false);
      toast({ title: "Period Created" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Timetable & Academic Calendar</h2>
            <p className="text-sm text-white/80 mt-1">Institutional schedules, terminal exams, and period structures</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Lessons Active" value={ttLoading ? '...' : timetable.length.toString()} color="bg-violet-50" icon={<BookOpen className="w-4 h-4 text-violet-600" />} />
        <StatCard label="Upcoming Exams" value={examsLoading ? '...' : exams.length.toString()} color="bg-red-50" icon={<FileText className="w-4 h-4 text-red-600" />} />
        <StatCard label="Standard Periods" value={periodsLoading ? '...' : periods.length.toString()} color="bg-amber-50" icon={<Timer className="w-4 h-4 text-amber-600" />} />
        <StatCard label="Session Status" value="Active" color="bg-teal-50" icon={<Database className="w-4 h-4 text-teal-600" />} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-100 px-4 bg-gray-50/30">
          <button onClick={() => setActiveTab('timetable')} className={`px-6 py-3 text-xs font-bold uppercase border-b-2 ${activeTab === 'timetable' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500'}`}>Weekly Schedule</button>
          <button onClick={() => setActiveTab('exams')} className={`px-6 py-3 text-xs font-bold uppercase border-b-2 ${activeTab === 'exams' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500'}`}>Terminal Exams</button>
          {isAdmin && <button onClick={() => setActiveTab('periods')} className={`px-6 py-3 text-xs font-bold uppercase border-b-2 ${activeTab === 'periods' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500'}`}>Period Setup</button>}
        </div>

        <div className="p-5">
          {activeTab === 'timetable' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Select value={activeGrade} onValueChange={setActiveGrade}>
                  <SelectTrigger className="w-[180px] h-9 text-xs font-bold"><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>{availableGrades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
                {isAdmin && (
                  <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
                    <DialogTrigger asChild><Button size="sm" className="bg-indigo-600 text-xs font-bold h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> Schedule Lesson</Button></DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <form onSubmit={handleAddLesson}>
                        <DialogHeader><DialogTitle>Schedule Academic Slot</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Subject</Label>
                              <Select name="subject" required>
                                <SelectTrigger><SelectValue placeholder="Choose subject..." /></SelectTrigger>
                                <SelectContent>
                                  {subjects.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Teacher</Label>
                              <Select name="teacherId" required>
                                <SelectTrigger><SelectValue placeholder="Select teacher..." /></SelectTrigger>
                                <SelectContent>{teachers.map(t => <SelectItem key={t.uid} value={t.uid}>{t.displayName}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Standard Period Selection</Label>
                            <Select value={selectedPeriodId} onValueChange={handlePeriodSelect}>
                              <SelectTrigger><SelectValue placeholder="Select Period..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manual">Manual Entry</SelectItem>
                                {periods.map(p => (
                                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.startTime} - {p.endTime})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Day</Label>
                                <Select name="day" defaultValue="Monday">
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Start</Label>
                                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} readOnly={selectedPeriodId !== 'manual'} />
                              </div>
                              <div className="space-y-2">
                                <Label>End</Label>
                                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} readOnly={selectedPeriodId !== 'manual'} />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Period Tag</Label><Input name="period" placeholder="e.g. Period 1" required /></div>
                            <div className="space-y-2"><Label>Room</Label><Input name="room" placeholder="e.g. Room 3A" required /></div>
                          </div>
                        </div>
                        <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full">Finalize Slot</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="overflow-x-auto border rounded-xl">
                <div className="min-w-[800px] grid grid-cols-6 divide-x">
                  <div className="bg-gray-50 p-3 text-[10px] font-bold text-center">Day</div>
                  {DAYS.map(d => <div key={d} className="bg-gray-50 p-3 text-[10px] font-bold text-center">{d}</div>)}
                  <div className="p-3 text-center border-t bg-white h-[200px] flex items-center justify-center"><p className="text-[10px] font-bold text-gray-400">Class Hours</p></div>
                  {DAYS.map(d => (
                    <div key={d} className="p-2 space-y-2 border-t bg-white">
                      {timetable.filter(l => l.grade === activeGrade && l.day === d).map(l => (
                        <div key={l.id} className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-700">
                          {l.subject}
                          <div className="text-[8px] text-indigo-400 font-normal mt-1">{l.startTime} - {l.endTime} • {l.room}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'periods' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">Standard Period Library</h3>
                <Dialog open={isAddPeriodOpen} onOpenChange={setIsAddPeriodOpen}>
                  <DialogTrigger asChild><Button size="sm" className="bg-amber-600 text-xs font-bold h-8"><Plus className="h-3 w-3 mr-1" /> Add Period</Button></DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddPeriod}>
                      <DialogHeader><DialogTitle>Configure Time Slot</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Label>Period Name</Label><Input name="name" placeholder="e.g. Period 1" required />
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label>Start Time</Label><Input name="startTime" type="time" required /></div>
                          <div><Label>End Time</Label><Input name="endTime" type="time" required /></div>
                        </div>
                      </div>
                      <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full">Save Period</Button></DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {periods.map(p => (
                  <div key={p.id} className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between group shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-gray-800">{p.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{p.startTime} - {p.endTime}</p>
                    </div>
                    <button onClick={() => academicService.deletePeriodStructure(database, p.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className={`rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">{icon}</div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</span>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{label}</p>
    </div>
  );
}
