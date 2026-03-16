
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
  GraduationCap,
  CalendarCheck,
  Trash2,
  Settings2,
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
import { Lesson, Exam, Student, UserProfile, Classroom, PeriodStructure } from '@/lib/types';

const SUBJECTS: Record<string, { color: string }> = {
  'Mathematics': { color: 'bg-blue-100 text-blue-700 border-blue-200' },
  'English': { color: 'bg-purple-100 text-purple-700 border-purple-200' },
  'Shona': { color: 'bg-amber-100 text-amber-700 border-amber-200' },
  'Science': { color: 'bg-green-100 text-green-700 border-green-200' },
  'Social Studies': { color: 'bg-rose-100 text-rose-700 border-rose-200' },
  'ICT': { color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetableCalendarPage() {
  const [activeTab, setActiveTab] = useState('timetable');
  const [activeGrade, setActiveGrade] = useState('');
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isAddPeriodOpen, setIsAddPeriodOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lesson form state for auto-filling from period
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('manual');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const database = useDatabase();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  
  const { data: timetable, loading: ttLoading } = useRTDBCollection<Lesson>(database, 'timetable');
  const { data: exams, loading: examsLoading } = useRTDBCollection<Exam>(database, 'exams');
  const { data: periods, loading: periodsLoading } = useRTDBCollection<PeriodStructure>(database, 'period_structures');
  const { data: students } = useRTDBCollection<Student>(database, 'students');
  const { data: users } = useRTDBCollection<UserProfile>(database, 'users');
  const { data: classrooms } = useRTDBCollection<Classroom>(database, 'classrooms');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';
  const isParent = profile?.role === 'parent';

  const teachers = useMemo(() => users.filter(u => u.role === 'staff' || u.role === 'admin'), [users]);

  // Filter students linked to parent
  const myChildren = useMemo(() => {
    if (!isParent || !profile?.email) return [];
    return students.filter(s => s.parentEmail?.toLowerCase() === profile.email?.toLowerCase());
  }, [students, profile?.email, isParent]);

  const availableGrades = useMemo(() => {
    const grades = new Set<string>();
    if (isAdmin) {
      classrooms.forEach(c => grades.add(c.name));
      timetable.forEach(l => grades.add(l.grade));
    } else {
      myChildren.forEach(c => grades.add(c.grade));
    }
    return Array.from(grades).sort();
  }, [isAdmin, myChildren, classrooms, timetable]);

  useEffect(() => {
    if (!activeGrade && availableGrades.length > 0) {
      setActiveGrade(availableGrades[0]);
    }
  }, [availableGrades, activeGrade]);

  const filteredLessons = useMemo(() => {
    return timetable.filter((l) => l.grade === activeGrade);
  }, [timetable, activeGrade]);

  const handlePeriodSelect = (periodId: string) => {
    setSelectedPeriodId(periodId);
    if (periodId === 'manual') {
      setStartTime('');
      setEndTime('');
    } else {
      const period = periods.find(p => p.id === periodId);
      if (period) {
        setStartTime(period.startTime);
        setEndTime(period.endTime);
      }
    }
  };

  const handleAddLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const teacherId = formData.get('teacherId') as string;
    const teacher = teachers.find(t => t.uid === teacherId);
    
    let periodName = formData.get('period') as string;
    if (selectedPeriodId !== 'manual') {
      const p = periods.find(p => p.id === selectedPeriodId);
      if (p) periodName = p.name;
    }

    const data: Omit<Lesson, 'id' | 'createdAt'> = {
      grade: activeGrade,
      subject: formData.get('subject') as string,
      teacherId: teacherId,
      teacherName: teacher?.displayName || 'Unknown',
      room: formData.get('room') as string,
      day: formData.get('day') as string,
      period: periodName,
      startTime: startTime,
      endTime: endTime,
    };

    try {
      await academicService.scheduleLesson(database, data);
      setIsAddLessonOpen(false);
      toast({ title: "Lesson Scheduled", description: `${data.subject} added to ${activeGrade}.` });
      // Reset form
      setSelectedPeriodId('manual');
      setStartTime('');
      setEndTime('');
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
    const data: Omit<PeriodStructure, 'id' | 'createdAt'> = {
      name: formData.get('name') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
    };

    try {
      await academicService.addPeriodStructure(database, data);
      setIsAddPeriodOpen(false);
      toast({ title: "Period Created", description: `${data.name} is now available.` });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExam = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const teacherId = formData.get('teacherId') as string;
    const teacher = teachers.find(t => t.uid === teacherId);

    const data: Omit<Exam, 'id' | 'createdAt'> = {
      grade: formData.get('grade') as string,
      subject: formData.get('subject') as string,
      date: formData.get('date') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      room: formData.get('room') as string,
      teacherId: teacherId,
      teacherName: teacher?.displayName || 'Unknown',
    };

    try {
      await academicService.addExam(database, data);
      setIsAddExamOpen(false);
      toast({ title: "Exam Scheduled", description: `${data.subject} exam added.` });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!isAdmin || !confirm('Remove this lesson?')) return;
    try {
      await academicService.deleteLesson(database, id);
      toast({ title: "Lesson Removed" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (isParent && myChildren.length === 0 && !ttLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">No Timetable Linked</h2>
        <p className="text-xs text-gray-500">No student records associated with your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full"><circle cx="350" cy="30" r="80" fill="white" /><circle cx="50" cy="180" r="100" fill="white" /></svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{isParent ? 'Student Timetable' : 'Timetable & Academic Calendar'}</h2>
            <p className="text-sm text-white/80 mt-1">{isParent ? 'Weekly lesson schedules for your family' : 'Class schedules, exams, and institutional events'}</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3.5 h-3.5" /> Registry Live
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen className="w-4 h-4 text-violet-600" />} label="Lessons Active" value={ttLoading ? '...' : timetable.length.toString()} color="bg-violet-50" />
        <StatCard icon={<FileText className="w-4 h-4 text-red-600" />} label="Upcoming Exams" value={examsLoading ? '...' : exams.length.toString()} color="bg-red-50" />
        <StatCard icon={<Timer className="w-4 h-4 text-amber-600" />} label="Standard Periods" value={periodsLoading ? '...' : periods.length.toString()} color="bg-amber-50" />
        <StatCard icon={<CalendarCheck className="w-4 h-4 text-teal-600" />} label="Session Phase" value="Term 1 Active" color="bg-teal-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto bg-gray-50/30">
          <TabButton active={activeTab === 'timetable'} onClick={() => setActiveTab('timetable')} label="Weekly Schedule" />
          <TabButton active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} label="Terminal Exams" />
          {isAdmin && <TabButton active={activeTab === 'periods'} onClick={() => setActiveTab('periods')} label="Period Setup" />}
        </div>

        <div className="p-5">
          {activeTab === 'timetable' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Select value={activeGrade} onValueChange={setActiveGrade}>
                    <SelectTrigger className="w-[180px] h-9 text-xs font-bold bg-white">
                      <div className="flex items-center gap-2"><Users className="w-3 h-3 text-blue-500" /><SelectValue placeholder="Select Class" /></div>
                    </SelectTrigger>
                    <SelectContent>{availableGrades.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                
                {isAdmin && (
                  <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-9 text-xs font-bold gap-1.5 shadow-sm">
                        <Plus className="h-3.5 w-3.5" /> Schedule Lesson
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <form onSubmit={handleAddLesson}>
                        <DialogHeader><DialogTitle>Schedule Academic Slot</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Subject</Label>
                              <Select name="subject" defaultValue="Mathematics">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{Object.keys(SUBJECTS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Period Slot</Label>
                              <Select value={selectedPeriodId} onValueChange={handlePeriodSelect}>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select Period..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="manual">Manual Time Entry</SelectItem>
                                  {periods.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.startTime} - {p.endTime})</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Day</Label>
                                <Select name="day" defaultValue="Monday">
                                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                  <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input 
                                  className="bg-white"
                                  name="startTime" 
                                  type="time" 
                                  required 
                                  value={startTime}
                                  onChange={(e) => setStartTime(e.target.value)}
                                  readOnly={selectedPeriodId !== 'manual'}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input 
                                  className="bg-white"
                                  name="endTime" 
                                  type="time" 
                                  required 
                                  value={endTime}
                                  onChange={(e) => setEndTime(e.target.value)}
                                  readOnly={selectedPeriodId !== 'manual'}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Period Tag / Name</Label>
                              <Input name="period" placeholder="e.g. Period 1" required />
                            </div>
                            <div className="space-y-2">
                              <Label>Room</Label>
                              <Input name="room" placeholder="e.g. Room 3A" required />
                            </div>
                          </div>
                        </div>
                        <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600">Finalize Slot</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-[1fr_repeat(5,1fr)] gap-px bg-gray-100">
                    <div className="bg-gray-50 p-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Day</div>
                    {DAYS.map(day => <div key={day} className="bg-gray-50 p-3 text-[10px] font-bold text-gray-700 uppercase tracking-widest text-center">{day}</div>)}
                    
                    <div className="contents">
                      <div className="bg-white p-3 text-center border-r border-gray-100 flex flex-col justify-center min-h-[120px]">
                        <p className="text-[10px] font-bold text-gray-800">Academic Sessions</p>
                      </div>
                      {DAYS.map(day => {
                        const dayLessons = filteredLessons.filter(l => l.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
                        return (
                          <div key={day} className="bg-white p-2 min-h-[120px] space-y-2">
                            {dayLessons.map(lesson => {
                              const config = SUBJECTS[lesson.subject] || { color: 'bg-gray-100 text-gray-700' };
                              return (
                                <div key={lesson.id} className={`p-2 rounded-lg border text-[10px] relative group hover:shadow-sm transition-all ${config.color}`}>
                                  {isAdmin && <button onClick={() => handleDeleteLesson(lesson.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/50"><X className="w-2.5 h-2.5" /></button>}
                                  <p className="font-bold leading-tight truncate">{lesson.subject}</p>
                                  <p className="text-[9px] opacity-80 mt-0.5 truncate">{lesson.teacherName}</p>
                                  <div className="flex items-center justify-between mt-1.5 opacity-60 text-[8px]">
                                    <span className="flex items-center gap-1 font-bold"><Clock className="w-2.5 h-2.5" /> {lesson.startTime}</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {lesson.room}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Upcoming Terminal Exams</h3>
                {isAdmin && (
                  <Dialog open={isAddExamOpen} onOpenChange={setIsAddExamOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-rose-600 hover:bg-rose-700 h-8 text-[10px] font-bold gap-1.5 shadow-sm">
                        <Plus className="h-3 w-3" /> Schedule Exam
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleAddExam}>
                        <DialogHeader><DialogTitle>Schedule Terminal Exam</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Grade</Label>
                              <Select name="grade" required>
                                <SelectTrigger><SelectValue placeholder="Select grade..." /></SelectTrigger>
                                <SelectContent>{availableGrades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Subject</Label>
                              <Input name="subject" placeholder="Subject" required />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <Input name="date" type="date" required />
                            <Input name="startTime" type="time" required />
                            <Input name="endTime" type="time" required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Input name="room" placeholder="Room/Hall" required />
                            <Select name="teacherId" required>
                              <SelectTrigger><SelectValue placeholder="Invigilator..." /></SelectTrigger>
                              <SelectContent>{teachers.map(t => <SelectItem key={t.uid} value={t.uid}>{t.displayName}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full bg-rose-600">Post Exam</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {examsLoading ? (
                <div className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-rose-500" /></div>
              ) : exams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exams.map((exam) => (
                    <div key={exam.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all group bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-bold uppercase">{exam.grade}</span>
                        {isAdmin && <button onClick={() => academicService.deleteExam(database, exam.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>}
                      </div>
                      <p className="text-sm font-bold text-gray-800">{exam.subject} Exam</p>
                      <div className="mt-3 space-y-2 text-[11px] text-gray-500 font-medium">
                        <div className="flex items-center gap-2"><CalendarIcon className="h-3.5 w-3.5 text-blue-500" /> {new Date(exam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-amber-500" /> {exam.startTime} - {exam.endTime}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-emerald-500" /> {exam.room}</div>
                        <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-purple-500" /> {exam.teacherName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center text-gray-400 italic text-xs border-2 border-dashed rounded-2xl">No terminal exams scheduled.</div>
              )}
            </div>
          )}

          {activeTab === 'periods' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Institutional Period Structure</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Define global time slots for the weekly timetable.</p>
                </div>
                <Dialog open={isAddPeriodOpen} onOpenChange={setIsAddPeriodOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-8 text-[10px] font-bold gap-1.5 shadow-sm">
                      <Plus className="h-3 w-3" /> Add Period Slot
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddPeriod}>
                      <DialogHeader><DialogTitle>Configure Time Slot</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Period Name</Label>
                          <Input name="name" placeholder="e.g. Period 1" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input name="startTime" type="time" required />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input name="endTime" type="time" required />
                          </div>
                        </div>
                      </div>
                      <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full bg-amber-600">Save Period</Button></DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {periodsLoading ? (
                  <div className="col-span-full py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" /></div>
                ) : periods.length > 0 ? periods.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((p) => (
                  <div key={p.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                        <Timer className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{p.startTime} - {p.endTime}</p>
                      </div>
                    </div>
                    <button onClick={() => academicService.deletePeriodStructure(database, p.id)} className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )) : (
                  <div className="col-span-full p-20 text-center border-2 border-dashed rounded-2xl bg-gray-50/30">
                    <Timer className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 font-medium">No period slots defined yet.</p>
                  </div>
                )}
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
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>{icon}</div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</span>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{label}</p>
    </div>
  );
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} className={`px-6 py-3 text-xs font-bold uppercase tracking-tighter border-b-2 transition-colors whitespace-nowrap ${active ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
      {label}
    </button>
  );
}
