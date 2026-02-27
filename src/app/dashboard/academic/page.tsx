
"use client"

import { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  BookOpen,
  ChevronDown
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Academic Management</h2>
          <p className="text-xs text-gray-500">Curriculum, marks entry, grading, and report card generation</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="Grade 5" onValueChange={setActiveGrade}>
            <SelectTrigger className="w-[120px] h-9 text-xs bg-white border-gray-200">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'].map(grade => (
                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="flex items-center gap-1.5 h-9 text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white">
            <FileText className="h-3.5 w-3.5" /> Generate Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Class Average" value="72.4%" subValue={activeGrade} color="bg-teal-50 text-teal-600" />
        <MetricCard label="Highest Score" value="94%" subValue="Chipo Banda" color="bg-green-50 text-green-600" />
        <MetricCard label="Pass Rate" value="89.2%" subValue="41/46 pupils" color="bg-blue-50 text-blue-600" />
        <MetricCard label="Subjects" value="8" subValue="Active this term" color="bg-purple-50 text-purple-600" />
      </div>

      {/* Main Content Area */}
      <Card className="border-gray-100 overflow-hidden">
        <Tabs defaultValue="performance" className="w-full">
          <div className="border-b border-gray-100 px-4 pt-1 bg-white">
            <TabsList className="bg-transparent h-auto p-0 gap-4">
              <TabsTrigger 
                value="performance" 
                className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none"
              >
                Performance Overview
              </TabsTrigger>
              <TabsTrigger 
                value="marks" 
                className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none"
              >
                Marks Entry
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none"
              >
                Report Cards
              </TabsTrigger>
              <TabsTrigger 
                value="subjects" 
                className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none"
              >
                Subject Setup
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="performance" className="p-5 mt-0 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trend Chart */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800">Performance Trend by Grade</h4>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                      <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                      />
                      <Line type="monotone" dataKey="grade4" stroke="#0D9488" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} name="Grade 4" />
                      <Line type="monotone" dataKey="grade5" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} name="Grade 5" />
                      <Line type="monotone" dataKey="grade6" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} name="Grade 6" />
                      <Line type="monotone" dataKey="grade7" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} name="Grade 7" />
                      <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Subject Performance Chart */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800">Subject Performance ({activeGrade})</h4>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                      />
                      <Bar dataKey="Average" fill="#0D9488" radius={[4, 4, 0, 0]} barSize={12} name="Average" />
                      <Bar dataKey="Highest" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={12} name="Highest" />
                      <Bar dataKey="Lowest" fill="#FCA5A5" radius={[4, 4, 0, 0]} barSize={12} name="Lowest" />
                      <Legend verticalAlign="bottom" align="center" iconType="rect" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="marks" className="p-8 text-center text-muted-foreground italic text-sm">
            Marks entry interface for {activeGrade} is being initialized...
          </TabsContent>
          <TabsContent value="reports" className="p-8 text-center text-muted-foreground italic text-sm">
            Report card generation module loading...
          </TabsContent>
          <TabsContent value="subjects" className="p-8 text-center text-muted-foreground italic text-sm">
            Subject configuration for {activeGrade}...
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
