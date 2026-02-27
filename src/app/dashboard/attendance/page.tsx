
"use client"

import { useState, useMemo } from 'react';
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
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { collection, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const firestore = useFirestore();

  const attendanceQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'attendance'),
      where('date', '==', new Date().toISOString().split('T')[0])
    );
  }, [firestore]);

  const { data: attendanceData, loading } = useCollection(attendanceQuery);

  const filtered = useMemo(() => {
    if (!attendanceData) return [];
    return attendanceData.filter((s: any) => 
      s.studentName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [attendanceData, search]);

  const toggleStatus = async (id: string, newStatus: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'attendance', id);
    
    updateDoc(docRef, { 
      status: newStatus, 
      lastUpdated: serverTimestamp() 
    }).catch(async () => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { status: newStatus }
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2 text-gray-900">Daily Attendance</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter Class
          </Button>
          <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
            <CheckCircle2 className="h-4 w-4" />
            Finalize Logs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard 
          title="Present" 
          value={attendanceData.filter((s: any) => s.status === 'present').length} 
          total={attendanceData.length || 1} 
          color="text-green-500" 
        />
        <SummaryCard 
          title="Absent" 
          value={attendanceData.filter((s: any) => s.status === 'absent').length} 
          total={attendanceData.length || 1} 
          color="text-red-500" 
        />
        <SummaryCard 
          title="Late" 
          value={attendanceData.filter((s: any) => s.status === 'late').length} 
          total={attendanceData.length || 1} 
          color="text-amber-500" 
        />
      </div>

      <Card className="border-border/50 overflow-hidden bg-white">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Attendance Register - Grade 10A</CardTitle>
              <CardDescription>Roll call for Homeroom Session</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10 border-gray-200" 
                placeholder="Search students..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-teal-600" />
              <p>Syncing attendance data...</p>
            </div>
          ) : (
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
                {filtered.length > 0 ? filtered.map((student: any) => (
                  <TableRow key={student.id} className="group">
                    <TableCell className="font-medium">{student.studentName}</TableCell>
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
                      {student.lastUpdated?.toDate ? student.lastUpdated.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className={`h-8 w-8 ${student.status === 'present' ? 'bg-teal-500/20 text-teal-600' : ''}`}
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
                          className={`h-8 w-8 ${student.status === 'late' ? 'bg-amber-500/20 text-amber-600' : ''}`}
                          onClick={() => toggleStatus(student.id, 'late')}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No records found for today.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, total, color }: { title: string, value: number, total: number, color: string }) {
  const percentage = Math.round((value / total) * 100);
  return (
    <Card className="border-border/50 bg-white">
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
