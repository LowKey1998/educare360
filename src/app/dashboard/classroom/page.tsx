
"use client"

import { useState, useMemo } from 'react';
import { 
  BookOpen, 
  LayoutGrid, 
  Users, 
  FileText, 
  ClipboardList, 
  Search, 
  MapPin, 
  Loader2,
  Trash2,
  Plus,
  Database,
  Radio,
  Clock,
  CheckCircle2,
  ChevronRight
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { academicService } from '@/services/academic';
import { Classroom, LessonPlan, UserProfile, Lesson } from '@/lib/types';

export default function ClassroomManagementPage() {
  const [activeTab, setActiveTab] = useState('rooms');
  const [search, setSearch] = useState('');
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const { data: classrooms, loading: roomsLoading } = useRTDBCollection<Classroom>(database, 'classrooms');
  const { data: lessonPlans, loading: plansLoading } = useRTDBCollection<LessonPlan>(database, 'lesson_plans');
  const { data: users, loading: usersLoading } = useRTDBCollection<UserProfile>(database, 'users');
  const { data: timetable } = useRTDBCollection<Lesson>(database, 'timetable');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';

  const teachers = useMemo(() => {
    return users.filter(u => u.role === 'staff' || u.role === 'admin');
  }, [users]);

  const liveSessions = useMemo(() => {
    if (!timetable) return [];
    // Simplistic current session check based on day
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];
    return timetable.filter(l => l.day === currentDay);
  }, [timetable]);

  const filteredClassrooms = useMemo(() => {
    return classrooms.filter((c) => 
      c.name?.toLowerCase().includes(search.toLowerCase()) || 
      c.teacherName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [classrooms, search]);

  const filteredPlans = useMemo(() => {
    return lessonPlans.filter((p) => 
      p.topic?.toLowerCase().includes(search.toLowerCase()) || 
      p.teacherName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [lessonPlans, search]);

  const handleAddClassroom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const teacherId = formData.get('teacherId') as string;
    const teacher = teachers.find(t => t.uid === teacherId);

    const data: Omit<Classroom, 'id' | 'createdAt'> = {
      name: formData.get('name') as string,
      teacherId: teacherId,
      teacherName: teacher?.displayName || 'Unknown',
      location: formData.get('location') as string,
      capacity: parseInt(formData.get('capacity') as string) || 35,
      status: 'Active',
    };

    try {
      await academicService.addClassroom(database, data);
      setIsAddRoomOpen(false);
      toast({ title: "Classroom Added", description: `${data.name} is now ready.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to create classroom.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLessonPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const teacherId = formData.get('teacherId') as string;
    const teacher = teachers.find(t => t.uid === teacherId);

    const data: Omit<LessonPlan, 'id' | 'createdAt'> = {
      grade: formData.get('grade') as string,
      subject: formData.get('subject') as string,
      teacherId: teacherId,
      teacherName: teacher?.displayName || 'Unknown',
      topic: formData.get('topic') as string,
      objectives: formData.get('objectives') as string,
      status: 'Draft'
    };

    try {
      await academicService.addLessonPlan(database, data);
      setIsAddPlanOpen(false);
      toast({ title: "Lesson Plan Created", description: `Plan for ${data.topic} saved.` });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Classroom Management</h2>
            <p className="text-sm text-white/80 mt-1">Manage institutional learning spaces, lesson plans, and live teaching sessions</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3.5 h-3.5" /> Registry Live
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Rooms" value={roomsLoading ? '...' : classrooms.length.toString()} icon={<LayoutGrid className="w-4 h-4 text-blue-600" />} color="bg-blue-50" />
        <StatCard label="Lesson Plans" value={plansLoading ? '...' : lessonPlans.length.toString()} icon={<FileText className="w-4 h-4 text-amber-600" />} color="bg-amber-50" />
        <StatCard label="Live Sessions" value={liveSessions.length.toString()} icon={<Radio className="w-4 h-4 text-red-600 animate-pulse" />} color="bg-red-50" />
        <StatCard label="Teachers Active" value={teachers.length.toString()} icon={<Users className="w-4 h-4 text-purple-600" />} color="bg-purple-50" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="flex items-center justify-between p-1 border-b border-gray-100">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger value="rooms" className="px-6 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:text-amber-600 rounded-none bg-transparent">Learning Spaces</TabsTrigger>
              <TabsTrigger value="plans" className="px-6 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:text-amber-600 rounded-none bg-transparent">Lesson Plans</TabsTrigger>
              <TabsTrigger value="live" className="px-6 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:text-amber-600 rounded-none bg-transparent">Live Activity</TabsTrigger>
            </TabsList>
            
            <div className="px-4 flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-8 h-8 text-[10px] w-48 border-gray-200" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {isAdmin && activeTab === 'rooms' && (
                <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-8 text-[10px] font-bold gap-1.5 shadow-sm">
                      <Plus className="h-3 w-3" /> Add Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddClassroom}>
                      <DialogHeader><DialogTitle>Register Learning Space</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Room Name/Code</Label>
                          <Input name="name" placeholder="e.g. Grade 2A" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Assigned Teacher</Label>
                          <Select name="teacherId" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a teacher..." />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map(t => (
                                <SelectItem key={t.uid} value={t.uid}>{t.displayName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Location</Label>
                            <Input name="location" placeholder="e.g. Main Block" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Capacity</Label>
                            <Input name="capacity" type="number" placeholder="35" required />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-600">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Confirm Room
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
              {isAdmin && activeTab === 'plans' && (
                <Dialog open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-8 text-[10px] font-bold gap-1.5 shadow-sm">
                      <Plus className="h-3 w-3" /> New Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <form onSubmit={handleAddLessonPlan}>
                      <DialogHeader><DialogTitle>Create Academic Lesson Plan</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Grade</Label>
                            <Input name="grade" placeholder="e.g. Grade 5" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input name="subject" placeholder="e.g. Science" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Author/Teacher</Label>
                          <Select name="teacherId" required>
                            <SelectTrigger><SelectValue placeholder="Select teacher..." /></SelectTrigger>
                            <SelectContent>
                              {teachers.map(t => <SelectItem key={t.uid} value={t.uid}>{t.displayName}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Topic</Label>
                          <Input name="topic" placeholder="e.g. The Water Cycle" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Learning Objectives</Label>
                          <Textarea name="objectives" placeholder="What should students learn?" required />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-600">Save Plan</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <div className="p-0">
            <TabsContent value="rooms" className="m-0">
              {roomsLoading ? (
                <div className="p-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-amber-500" /></div>
              ) : filteredClassrooms.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {filteredClassrooms.map((room) => (
                    <div key={room.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                          <LayoutGrid className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{room.name}</p>
                          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400 font-medium">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {room.location}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Cap: {room.capacity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-gray-700">{room.teacherName}</p>
                          <p className="text-[9px] text-gray-400">Class Teacher</p>
                        </div>
                        {isAdmin && (
                          <button onClick={() => academicService.deleteClassroom(database, room.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center text-gray-400 italic text-xs">No learning spaces registered.</div>
              )}
            </TabsContent>

            <TabsContent value="plans" className="m-0">
              {plansLoading ? (
                <div className="p-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-amber-500" /></div>
              ) : filteredPlans.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {filteredPlans.map((plan) => (
                    <div key={plan.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{plan.topic}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{plan.grade} • {plan.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          plan.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {plan.status}
                        </span>
                        <div className="text-right min-w-[100px]">
                          <p className="text-[10px] font-bold text-gray-700">{plan.teacherName}</p>
                          <p className="text-[9px] text-gray-400">Owner</p>
                        </div>
                        {isAdmin && (
                          <button onClick={() => academicService.deleteLessonPlan(database, plan.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center text-gray-400 italic text-xs">No lesson plans drafted.</div>
              )}
            </TabsContent>

            <TabsContent value="live" className="m-0">
              <div className="divide-y divide-gray-50">
                {liveSessions.length > 0 ? liveSessions.map((session) => (
                  <div key={session.id} className="p-4 flex items-center justify-between hover:bg-red-50/10 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 relative">
                        <Radio className="h-5 w-5 animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-gray-800">{session.subject}</p>
                          <span className="text-[8px] px-1.5 py-0.5 bg-red-100 text-red-700 font-bold rounded">LIVE</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{session.grade} • {session.room}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-[10px] font-mono font-bold text-gray-600">{session.startTime} - {session.endTime}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-700">{session.teacherName}</p>
                        <p className="text-[9px] text-gray-400">Presenting</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                )) : (
                  <div className="p-20 text-center flex flex-col items-center gap-3">
                    <ClipboardList className="h-10 w-10 text-gray-100" />
                    <p className="text-gray-400 italic text-xs">No live sessions recorded for this time period.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${color} text-gray-700`}>{label}</span>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
