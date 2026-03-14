
"use client"

import { useState, useMemo } from 'react';
import { 
  FileText, 
  Search,
  BookOpen,
  Plus,
  Save,
  Loader2,
  Trophy
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
import { Card, CardContent } from '@/components/ui/card';
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
import { ref, update, serverTimestamp } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const trendData = [
  { name: 'T1 2025', grade4: 68, grade5: 72, grade6: 75, grade7: 70 },
  { name: 'T2 2025', grade4: 70, grade5: 74, grade6: 72, grade7: 73 },
  { name: 'T3 2025', grade4: 73, grade5: 76, grade6: 78, grade7: 77 },
  { name: 'T1 2026', grade4: 75, grade5: 78, grade6: 80, grade7: 79 },
];

const subjectData = [
  { name: 'ENG', Average: 72, Highest: 92, Lowest: 58 },
  { name: 'MAT', Average: 85, Highest: 98, Lowest: 65 },
  { name: 'SHO', Average: 78, Highest: 94, Lowest: 62 },
  { name: 'SCI', Average: 80, Highest: 96, Lowest: 68 },
  { name: 'SOC', Average: 74, Highest: 90, Lowest: 60 },
  { name: 'ICT', Average: 78, Highest: 95, Lowest: 64 },
];

export default function AcademicManagementPage() {
  const [activeGrade, setActiveGrade] = useState('Grade 5');
  const [activeSubject, setActiveSubject] = useState('ENG');
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: students, loading } = useRTDBCollection(database, 'students');

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.grade === activeGrade);
  }, [students, activeGrade]);

  const handleSaveMarks = async () => {
    setIsSaving(true);
    try {
      const updates: any = {};
      Object.entries(marks).forEach(([studentId, score]) => {
        updates[`students/${studentId}/marks/${activeSubject}`] = score;
        updates[`students/${studentId}/lastAcademicUpdate`] = serverTimestamp();
      });
      await update(ref(database), updates);
      toast({ title: "Marks Saved", description: `Updated ${Object.keys(marks).length} records for ${activeSubject}.` });
      setMarks({});
    } catch (e) {
      toast({ title: "Error", description: "Failed to save marks.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Academic Management</h2>
          <p className="text-xs text-gray-500">Curriculum, marks entry, and academic performance tracking</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="Grade 5" onValueChange={setActiveGrade}>
            <SelectTrigger className="w-[120px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'].map(grade => (
                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Grade Avg" value="72.4%" subValue={activeGrade} color="bg-teal-50 text-teal-600" />
        <MetricCard label="Top Performer" value="Tendai M." subValue="Average 94%" color="bg-green-50 text-green-600" />
        <MetricCard label="Pass Rate" value="89.2%" subValue="41/46 pupils" color="bg-blue-50 text-blue-600" />
        <MetricCard label="Current Term" value="Term 1" subValue="2026 Academic" color="bg-purple-50 text-purple-600" />
      </div>

      <Card className="border-gray-100 overflow-hidden shadow-sm">
        <Tabs defaultValue="performance" className="w-full">
          <div className="border-b border-gray-100 px-4 pt-1 bg-white">
            <TabsList className="bg-transparent h-auto p-0 gap-4">
              <TabsTrigger value="performance" className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">Performance Overview</TabsTrigger>
              <TabsTrigger value="marks" className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">Marks Entry</TabsTrigger>
              <TabsTrigger value="subjects" className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">Subjects</TabsTrigger>
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
                  <p className="text-[10px] text-gray-400 italic font-medium">Entering Term 1 Marks</p>
                </div>
                <Button onClick={handleSaveMarks} disabled={isSaving || Object.keys(marks).length === 0} size="sm" className="h-9 gap-1.5 bg-teal-600 hover:bg-teal-700">
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save All Marks
                </Button>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center text-xs text-gray-400 italic">Syncing student list...</div>
                ) : filteredStudents.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase">Pupil Name</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase">Last Recorded</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-500 uppercase">Current Score (0-100)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{s.studentName}</div>
                            <div className="text-[10px] text-gray-400">{s.admissionNo}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {s.marks?.[activeSubject] ? `Previous: ${s.marks[activeSubject]}%` : 'No mark recorded'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Input 
                              type="number" 
                              className="w-20 ml-auto h-8 text-xs text-right"
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

          <TabsContent value="subjects" className="p-8 text-center text-gray-400 italic text-xs">
            Subject configuration and curriculum planning...
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, subValue, color }: { label: string, value: string, subValue: string, color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${color}`}>{label}</span>
      <p className="text-2xl font-bold text-gray-800 mt-3">{value}</p>
      <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">{subValue}</p>
    </div>
  );
}
