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
  Search, 
  Plus, 
  MoreHorizontal, 
  Filter, 
  FileCheck,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const applications = [
  { id: 'APP-001', student: 'Leo Messi', parent: 'Jorge Messi', grade: 'Grade 5', date: '2024-10-01', status: 'Pending' },
  { id: 'APP-002', student: 'Serena Williams', parent: 'Richard Williams', grade: 'Grade 2', date: '2024-10-02', status: 'Approved' },
  { id: 'APP-003', student: 'Elon Musk', parent: 'Maye Musk', grade: 'ECD B', date: '2024-10-03', status: 'Reviewing' },
  { id: 'APP-004', student: 'Ada Lovelace', parent: 'Lord Byron', grade: 'Grade 9', date: '2024-10-04', status: 'Approved' },
  { id: 'APP-005', student: 'Alan Turing', parent: 'Julius Turing', grade: 'Grade 10', date: '2024-10-05', status: 'Declined' },
];

export default function AdmissionsPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2">Admissions & Enrollment</h1>
          <p className="text-muted-foreground">Manage incoming applications and student onboarding.</p>
        </div>
        <Button className="gap-2 h-11">
          <Plus className="h-5 w-5" />
          New Application
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusBox label="Total Apps" count={42} />
        <StatusBox label="Pending" count={18} color="text-primary" />
        <StatusBox label="Approved" count={20} color="text-green-500" />
        <StatusBox label="Declined" count={4} color="text-destructive" />
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10 h-10" 
                placeholder="Search by student or application ID..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <FileCheck className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Parent/Guardian</TableHead>
                <TableHead>Target Grade</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.filter(a => a.student.toLowerCase().includes(search.toLowerCase())).map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-mono text-xs font-semibold text-primary">{app.id}</TableCell>
                  <TableCell className="font-medium">{app.student}</TableCell>
                  <TableCell>{app.parent}</TableCell>
                  <TableCell>{app.grade}</TableCell>
                  <TableCell className="text-muted-foreground">{app.date}</TableCell>
                  <TableCell>
                    <Badge variant={
                      app.status === 'Approved' ? 'default' : 
                      app.status === 'Declined' ? 'destructive' : 
                      'outline'
                    } className="px-2.5">
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <Eye className="h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer text-green-500 focus:text-green-500">
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                          <XCircle className="h-4 w-4" /> Decline
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

function StatusBox({ label, count, color }: { label: string, count: number, color?: string }) {
  return (
    <div className="p-4 rounded-xl border border-border/50 bg-card/50 flex flex-col justify-center items-center">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <h4 className={`text-2xl font-bold font-headline ${color || 'text-foreground'}`}>{count}</h4>
    </div>
  );
}