
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
  Search, 
  Plus, 
  MoreHorizontal, 
  Filter, 
  FileCheck,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';

export default function AdmissionsPage() {
  const [search, setSearch] = useState('');
  const firestore = useFirestore();

  const admissionsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'admissions'),
      orderBy('submissionDate', 'desc'),
      limit(50)
    );
  }, [firestore]);

  const { data: applications, loading } = useCollection(admissionsQuery);

  const filteredApps = useMemo(() => {
    if (!applications) return [];
    return applications.filter(a => 
      (a.studentName?.toLowerCase().includes(search.toLowerCase())) ||
      (a.applicationId?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [applications, search]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2 text-gray-900">Admissions & Enrollment</h1>
          <p className="text-muted-foreground">Manage incoming applications and student onboarding.</p>
        </div>
        <Button className="gap-2 h-11 bg-teal-600 hover:bg-teal-700">
          <Plus className="h-5 w-5" />
          New Application
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusBox label="Total Apps" count={applications.length} />
        <StatusBox label="Pending" count={applications.filter(a => a.status === 'Pending').length} color="text-teal-600" />
        <StatusBox label="Approved" count={applications.filter(a => a.status === 'Approved').length} color="text-green-500" />
        <StatusBox label="Declined" count={applications.filter(a => a.status === 'Declined').length} color="text-destructive" />
      </div>

      <Card className="border-border/50 bg-white">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10 h-10 border-gray-200" 
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
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-teal-600" />
              <p>Fetching real-time applications...</p>
            </div>
          ) : (
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
                {filteredApps.length > 0 ? filteredApps.map((app: any) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-xs font-semibold text-teal-600">{app.applicationId || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{app.studentName}</TableCell>
                    <TableCell>{app.parentName}</TableCell>
                    <TableCell>{app.grade}</TableCell>
                    <TableCell className="text-muted-foreground">{app.submissionDate || 'N/A'}</TableCell>
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
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No applications found.
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

function StatusBox({ label, count, color }: { label: string, count: number, color?: string }) {
  return (
    <div className="p-4 rounded-xl border border-border/50 bg-white flex flex-col justify-center items-center shadow-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <h4 className={`text-2xl font-bold font-headline ${color || 'text-gray-900'}`}>{count}</h4>
    </div>
  );
}
