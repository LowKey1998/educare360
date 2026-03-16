
"use client"

import { useState, useMemo } from 'react';
import { 
  Plus, 
  BookOpen, 
  Star, 
  TrendingUp, 
  Heart, 
  Smile, 
  Eye,
  Check,
  Database,
  Loader2,
  Activity,
  Award
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useDatabase, useRTDBCollection } from '@/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const radarData = [
  { subject: 'Language', A: 78, B: 85, fullMark: 100 },
  { subject: 'Numeracy', A: 65, B: 75, fullMark: 100 },
  { subject: 'Physical', A: 85, B: 90, fullMark: 100 },
  { subject: 'Social', A: 72, B: 82, fullMark: 100 },
  { subject: 'Creative', A: 90, B: 95, fullMark: 100 },
  { subject: 'Environmental', A: 60, B: 70, fullMark: 100 },
];

export default function ECDDevelopmentPage() {
  const [activeTab, setActiveTab] = useState('milestones');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: students, loading: studentsLoading } = useRTDBCollection(database, 'students');
  const { data: observations, loading: obsLoading } = useRTDBCollection(database, 'ecd_observations');

  const ecdStudents = useMemo(() => {
    return students.filter(s => ['Baby Class', 'Middle Class', 'Reception'].includes(s.grade));
  }, [students]);

  const handleAddObservation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const studentId = formData.get('studentId') as string;
    const student = ecdStudents.find(s => s.id === studentId);

    const data = {
      studentId,
      studentName: student?.studentName || "Unknown",
      grade: student?.grade || "N/A",
      type: formData.get('type'),
      content: formData.get('content'),
      author: "ECD Specialist",
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    };

    try {
      await push(ref(database, 'ecd_observations'), data);
      setIsAddOpen(false);
      toast({ title: "Observation Logged", description: `Saved entry for ${data.studentName}.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to save observation.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* High-Fidelity Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="30" r="80" fill="white" />
            <circle cx="100" cy="180" r="120" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">ECD Development Hub</h2>
            <p className="text-sm text-white/80 mt-1">Track milestones, daily routines, and foundation years development</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3.5 h-3.5" /> Development Sync Active
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('milestones')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-tighter border-b-2 transition-colors whitespace-nowrap ${activeTab === 'milestones' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Milestones & Skills
          </button>
          <button 
            onClick={() => setActiveTab('observations')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-tighter border-b-2 transition-colors whitespace-nowrap ${activeTab === 'observations' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Observation Journal
          </button>
          <button 
            onClick={() => setActiveTab('pupils')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-tighter border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pupils' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            ECD Pupils
          </button>
        </div>

        <div className="p-5">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Active Foundation Class</h3>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-9 text-xs font-bold gap-1.5 shadow-sm">
                    <Plus className="h-3.5 w-3.5" /> Log Observation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddObservation}>
                    <DialogHeader>
                      <DialogTitle>Foundation Development Log</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Select Student</Label>
                        <Select name="studentId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose student..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ecdStudents.map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.studentName} ({s.grade})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Development Area</Label>
                        <Select name="type" defaultValue="Language">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Language">Language & Communication</SelectItem>
                            <SelectItem value="Numeracy">Numeracy & Maths</SelectItem>
                            <SelectItem value="Physical">Physical Development</SelectItem>
                            <SelectItem value="Social">Social & Emotional</SelectItem>
                            <SelectItem value="Creative">Creative Arts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Observation Content</Label>
                        <Input name="content" placeholder="Describe the milestone or behaviour..." required />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-600">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save to Journal
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {activeTab === 'milestones' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                <div className="lg:col-span-1 bg-gray-50 rounded-xl p-4 border border-gray-100/50 shadow-inner">
                  <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Cross-Area Analysis</h4>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 9 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#ccc', fontSize: 8 }} />
                        <Radar name="Term 1" dataKey="A" stroke="#C4B5FD" fill="#C4B5FD" fillOpacity={0.3} />
                        <Radar name="Term 2" dataKey="B" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '10px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DevelopmentCard icon={<BookOpen className="w-4 h-4 text-blue-600" />} title="Language & Communication" progress={78} bgColor="bg-blue-50" />
                  <DevelopmentCard icon={<Star className="w-4 h-4 text-purple-600" />} title="Numeracy & Maths" progress={65} bgColor="bg-purple-50" />
                  <DevelopmentCard icon={<TrendingUp className="w-4 h-4 text-green-600" />} title="Physical Development" progress={85} bgColor="bg-green-50" />
                  <DevelopmentCard icon={<Heart className="w-4 h-4 text-rose-600" />} title="Social & Emotional" progress={72} bgColor="bg-rose-50" />
                </div>
              </div>
            )}

            {activeTab === 'observations' && (
              <div className="space-y-3">
                {obsLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                    <p className="text-xs text-gray-400 italic">Syncing observation journal...</p>
                  </div>
                ) : observations.length > 0 ? observations.map((obs: any) => (
                  <div key={obs.id} className="p-4 border border-gray-50 rounded-xl hover:bg-gray-50/50 transition-all group flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-800">{obs.studentName} — <span className="text-purple-600 font-bold">{obs.type}</span></p>
                        <span className="text-[10px] text-gray-400 font-bold">{obs.date}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{obs.content}</p>
                      <p className="text-[9px] text-gray-400 mt-2 italic">Logged by: {obs.author}</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center text-gray-400 italic text-xs">No foundation observations recorded this term.</div>
                )}
              </div>
            )}

            {activeTab === 'pupils' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ecdStudents.map(student => (
                  <div key={student.id} className="p-3 border border-gray-100 rounded-xl hover:shadow-md transition-all flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {student.studentName?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{student.studentName}</p>
                      <p className="text-[10px] text-gray-400">{student.grade}</p>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-purple-600 transition-colors"><Eye className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DevelopmentCard({ icon, title, progress, bgColor }: any) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all group">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate uppercase tracking-tighter">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-1000" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-purple-600">{progress}%</span>
          </div>
        </div>
      </div>
      <div className="space-y-1.5 pt-2 border-t border-gray-50">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
          <Check className="w-3 h-3 text-emerald-500" /> Milestone Tracking Active
        </div>
      </div>
    </div>
  );
}
