
"use client"

import { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Save, 
  Loader2, 
  Trophy, 
  Database, 
  TrendingUp, 
  FileText 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDatabase, useRTDBCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { academicService } from '@/services/academic';
import { Student } from '@/lib/types';

const trendData = [
  { name: 'T1 2025', grade4: 68, grade5: 72, grade6: 75, grade7: 70 },
  { name: 'T2 2025', grade4: 70, grade5: 74, grade6: 72, grade7: 73 },
  { name: 'T3 2025', grade4: 73, grade5: 76, grade6: 78, grade7: 77 },
  { name: 'T1 2026', grade4: 75, grade5: 78, grade6: 80, grade7: 79 },
];

export default function AcademicManagementPage() {
  const [activeGrade, setActiveGrade] = useState('Grade 5');
  const [activeSubject, setActiveSubject] = useState('ENG');
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: students, loading } = useRTDBCollection<Student>(database, 'students');

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.grade === activeGrade);
  }, [students, activeGrade]);

  const stats = useMemo(() => {
    if (filteredStudents.length === 0) return { avg: '0%', top: 'N/A', passRate: '0%' };
    
    let totalScore = 0;
    let count = 0;
    let passCount = 0;
    let topStudent = { name: 'None', score: 0 };

    filteredStudents.forEach(s => {
      const sMarks = s.marks || {};
      const scores = Object.values(sMarks) as number[];
      if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        totalScore += avg;
        count++;
        if (avg >= 50) passCount++;
        if (avg > topStudent.score) topStudent = { name: s.studentName, score: avg };
      }
    });

    return {
      avg: count > 0 ? `${(totalScore / count).toFixed(1)}%` : '0%',
      top: topStudent.name,
      topScore: topStudent.score > 0 ? `${topStudent.score.toFixed(0)}%` : 'N/A',
      passRate: count > 0 ? `${((passCount / count) * 100).toFixed(1)}%` : '0%'
    };
  }, [filteredStudents]);

  const handleSaveMarks = async () => {
    setIsSaving(true);
    try {
      await academicService.saveMarks(database, activeSubject, marks);
      toast({ title: "Marks Saved", description: `Updated ${Object.keys(marks).length} records for ${activeSubject}.` });
      setMarks({});
    } catch (e) {
      toast({ title: "Error", description: "Failed to save marks.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const subjectData = useMemo(() => {
    const subjects = ['ENG', 'MAT', 'SHO', 'SCI', 'SOC', 'ICT'];
    return subjects.map(sub => {
      const scores = filteredStudents.map(s => s.marks?.[sub]).filter(v => v !== undefined);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return { name: sub, Average: Math.round(avg) };
    });
  }, [filteredStudents]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Academic Management</h2>
            <p className="text-sm text-white/80 mt-1">Curriculum, marks entry, and academic performance tracking</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3 h-3" /> RTDB Active
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Select value={activeGrade} onValueChange={setActiveGrade}>
          <SelectTrigger className="w-[160px] h-10 text-xs bg-white">
            <SelectValue placeholder="Select Grade" />
          </SelectTrigger>
          <SelectContent>
            {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'].map(grade => (
              <SelectItem key={grade} value={grade}>{grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Grade Avg" value={stats.avg} subValue={activeGrade} color="bg-teal-50 text-teal-600" icon={<TrendingUp className="h-4 w-4" />} />
        <MetricCard label="Top Performer" value={stats.top} subValue={`Avg: ${stats.topScore}`} color="bg-green-50 text-green-600" icon={<Trophy className="h-4 w-4" />} />
        <MetricCard label="Pass Rate" value={stats.passRate} subValue={`${filteredStudents.length} pupils`} color="bg-blue-50 text-blue-600" icon={<FileText className="h-4 w-4" />} />
        <MetricCard label="Academic Session" value="Term 1" subValue="2026 Active" color="bg-purple-50 text-purple-600" icon={<BookOpen className="h-4 w-4" />} />
      </div>

      <Card className="border-gray-100 overflow-hidden shadow-sm">
        <Tabs defaultValue="performance" className="w-full">
          <div className="border-b border-gray-100 px-4 pt-1 bg-white">
            <TabsList className="bg-transparent h-auto p-0 gap-4">
              <TabsTrigger value="performance" className="px-4 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">Performance Overview</TabsTrigger>
              <TabsTrigger value="marks" className="px-4 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">Marks Entry</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="performance" className="p-5 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800">Historical Performance Trend</h4>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                      <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="grade5" stroke="#0D9488" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} name="Current Grade" />
                      <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800">Subject-wise Average ({activeGrade})</h4>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }} />
                      <Bar dataKey="Average" fill="#0D9488" radius={[4, 4, 0, 0]} barSize={12} name="Average Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="marks" className="p-5 mt-0 outline-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Select value={activeSubject} onValueChange={setActiveSubject}>
                    <SelectTrigger className="w-[160px] h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENG">English</SelectItem>
                      <SelectItem value="MAT">Mathematics</SelectItem>
                      <SelectItem value="SHO">Shona</SelectItem>
                      <SelectItem value="SCI">Science</SelectItem>
                      <SelectItem value="SOC">Social Studies</SelectItem>
                      <SelectItem value="ICT">ICT</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-gray-400 italic font-medium uppercase tracking-widest">Entering Term 1 Marks</p>
                </div>
                <Button onClick={handleSaveMarks} disabled={isSaving || Object.keys(marks).length === 0} size="sm" className="h-9 gap-1.5 bg-teal-600 hover:bg-teal-700">
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Post All Marks
                </Button>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center text-xs text-gray-400 italic">Syncing student list...</div>
                ) : filteredStudents.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-tighter">Pupil Name</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-tighter">Last Recorded</th>
                        <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-tighter">Score (0-100)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-gray-800">{s.studentName}</div>
                            <div className="text-[9px] text-gray-400 font-mono">{s.admissionNo}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {s.marks?.[activeSubject] !== undefined ? (
                              <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-bold">
                                Current: {s.marks[activeSubject]}%
                              </span>
                            ) : (
                              <span className="italic text-[10px]">Pending entry</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Input 
                              type="number" 
                              className="w-20 ml-auto h-8 text-xs text-right font-bold"
                              placeholder="--"
                              value={marks[s.id] ?? ''}
                              onChange={(e) => setMarks({...marks, [s.id]: parseInt(e.target.value)})}
                              min={0}
                              max={100}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center text-xs text-gray-400 italic">No students enrolled in {activeGrade}</div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, subValue, color, icon }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</span>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">{subValue}</p>
    </div>
  );
}
