"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { 
  Calendar as CalendarIcon, 
  Search, 
  UserCheck, 
  UserX, 
  Clock, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const initialStudents = [
  { id: '1', name: 'James Wilson', grade: '10A', status: 'present', lastUpdated: '08:45 AM' },
  { id: '2', name: 'Sophia Chen', grade: '10A', status: 'absent', lastUpdated: '09:02 AM' },
  { id: '3', name: 'Liam O’Brien', grade: '10A', status: 'late', lastUpdated: '09:15 AM' },
  { id: '4', name: 'Emma Garcia', grade: '10A', status: 'present', lastUpdated: '08:50 AM' },
  { id: '5', name: 'Noah Smith', grade: '10A', status: 'present', lastUpdated: '08:42 AM' },
  { id: '6', name: 'Ava Johnson', grade: '10A', status: 'absent', lastUpdated: '08:30 AM' },
];

export default function AttendancePage() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState('');

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = (id: string, newStatus: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus, lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : s));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2">Daily Attendance</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Thursday, October 10, 2024
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter Class
          </Button>
          <Button variant="default" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Finalize Logs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Present" value={students.filter(s => s.status === 'present').length} total={students.length} color="text-green-500" />
        <SummaryCard title="Absent" value={students.filter(s => s.status === 'absent').length} total={students.length} color="text-red-500" />
        <SummaryCard title="Late" value={students.filter(s => s.status === 'late').length} total={students.length} color="text-yellow-500" />
      </div>

      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Attendance Register - Grade 10A</CardTitle>
              <CardDescription>Roll call for Homeroom Session</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10" 
                placeholder="Search students..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Quick Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow key={student.id} className="group">
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>
                    <Badge variant={
                      student.status === 'present' ? 'default' : 
                      student.status === 'absent' ? 'destructive' : 
                      'outline'
                    } className="capitalize px-3">
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs italic">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {student.lastUpdated}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className={`h-8 w-8 ${student.status === 'present' ? 'bg-primary/20 text-primary' : ''}`}
                        onClick={() => toggleStatus(student.id, 'present')}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className={`h-8 w-8 ${student.status === 'absent' ? 'bg-destructive/20 text-destructive' : ''}`}
                        onClick={() => toggleStatus(student.id, 'absent')}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className={`h-8 w-8 ${student.status === 'late' ? 'bg-yellow-500/20 text-yellow-500' : ''}`}
                        onClick={() => toggleStatus(student.id, 'late')}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, total, color }: { title: string, value: number, total: number, color: string }) {
  const percentage = Math.round((value / total) * 100);
  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className={`text-3xl font-bold mt-1 ${color}`}>{value}</h3>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{percentage}%</p>
            <p className="text-xs text-muted-foreground">of class</p>
          </div>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
          <div 
            className={`h-full bg-current ${color}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}