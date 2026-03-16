
"use client"

import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Database, 
  DollarSign, 
  TrendingUp, 
  Loader2,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Wallet,
  Activity,
  Settings2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDatabase, useRTDBCollection, useUserProfile, useRTDBDoc } from '@/firebase';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { financeService } from '@/services/finance';
import { Student, Transaction, SystemSettings } from '@/lib/types';

const GRADES = ['Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];

export default function FinanceBillingPage() {
  const database = useDatabase();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  
  const { data: allStudents, loading: studentsLoading } = useRTDBCollection<Student>(database, 'students');
  const { data: allTransactions, loading: txLoading } = useRTDBCollection<Transaction>(database, 'transactions');
  const { data: schoolSettings } = useRTDBDoc<SystemSettings>(database, 'system_settings');
  
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Fee Config States
  const [feeAmount, setFeeAmount] = useState('');
  const [feeTerm, setFeeTerm] = useState('Term 1');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';
  const loading = studentsLoading || txLoading;
  const currencySymbol = schoolSettings?.currencySymbol || '$';

  // Load existing fee data from school settings when they become available
  useEffect(() => {
    if (schoolSettings) {
      if (schoolSettings.lastFeeAmount !== undefined) setFeeAmount(schoolSettings.lastFeeAmount.toString());
      if (schoolSettings.lastFeeTerm) setFeeTerm(schoolSettings.lastFeeTerm);
      if (schoolSettings.lastFeeGrades) setSelectedGrades(schoolSettings.lastFeeGrades);
    }
  }, [schoolSettings, isConfigOpen]);

  // Role-based data filtering
  const students = useMemo(() => {
    if (!allStudents) return [];
    if (isAdmin) return allStudents;
    return allStudents.filter(s => s.parentEmail?.toLowerCase() === profile?.email?.toLowerCase());
  }, [allStudents, isAdmin, profile?.email]);

  const transactions = useMemo(() => {
    if (!allTransactions) return [];
    if (isAdmin) return allTransactions;
    const myStudentIds = students.map(s => s.id);
    return allTransactions.filter(tx => myStudentIds.includes(tx.studentId));
  }, [allTransactions, isAdmin, students]);

  const stats = useMemo(() => {
    if (loading || students.length === 0) return { arrears: '0', debtors: 0, totalBilled: '0', collectionRate: '0.0', unpaidPct: '0.0' };

    const totalPaid = transactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);
    const totalArrears = students.reduce((acc, s) => acc + (parseFloat(s.feeBalance as any) || 0), 0);
    const totalBilled = totalPaid + totalArrears;
    const debtorCount = students.filter(s => (parseFloat(s.feeBalance as any) || 0) > 0).length;
    const collectionRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0;

    return {
      arrears: totalArrears.toLocaleString(),
      debtors: debtorCount,
      totalBilled: totalBilled.toLocaleString(),
      collectionRate: collectionRate.toFixed(1),
      unpaidPct: totalBilled > 0 ? ((totalArrears / totalBilled) * 100).toFixed(1) : '0.0'
    };
  }, [students, transactions, loading]);

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const studentId = formData.get('studentId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const method = formData.get('method') as string;

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    try {
      await financeService.recordPayment(
        database, 
        studentId, 
        student.studentName, 
        student.feeBalance, 
        amount, 
        method
      );
      setIsPayOpen(false);
      toast({ title: "Payment Recorded", description: `Updated balance for ${student.studentName}` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update payment.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyFees = async () => {
    if (!feeAmount || !feeTerm || selectedGrades.length === 0) {
      toast({ title: "Validation Error", description: "Please fill all fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const count = await financeService.applyTermFees(
        database, 
        parseFloat(feeAmount), 
        feeTerm, 
        selectedGrades
      );
      setIsConfigOpen(false);
      toast({ 
        title: "Fees Applied", 
        description: `Successfully billed ${count} students for ${feeTerm}.` 
      });
    } catch (e) {
      toast({ title: "Action Failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {isAdmin ? 'Finance & School Billing' : 'Household Fee Statement'}
            </h2>
            <p className="text-sm text-white/80 mt-1">
              {isAdmin 
                ? 'Real-time fee tracking, payment processing, and financial analytics' 
                : 'Track your family balances, view billing history, and monitor payments.'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3 h-3" /> Ledger Active
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceMetricCard label="Total Billed" value={`${currencySymbol}${stats?.totalBilled}`} trend={isAdmin ? "Global" : "Household"} icon={<CreditCard className="w-4 h-4 text-blue-600" />} color="bg-blue-50" />
        <FinanceMetricCard label="Outstanding" value={`${currencySymbol}${stats?.arrears}`} trend={`${stats?.unpaidPct}% of total`} icon={<Wallet className="w-4 h-4 text-amber-600" />} color="bg-amber-50" isPositive={false} />
        <FinanceMetricCard label={isAdmin ? "Collection Rate" : "Attendance Factor"} value={`${stats?.collectionRate}%`} trend={isAdmin ? "Target: 90%" : "Financial Health"} icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} color="bg-emerald-50" />
        <FinanceMetricCard label={isAdmin ? "Active Debtors" : "Pupils Billed"} value={isAdmin ? (stats?.debtors.toString() || '0') : students.length.toString()} trend={isAdmin ? "Pupils" : "In Account"} icon={<Users className="w-4 h-4 text-rose-600" />} color="bg-rose-50" isPositive={!isAdmin} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-gray-50 mb-4">
            <div>
              <CardTitle className="text-sm font-bold text-gray-800">
                {isAdmin ? 'Student Ledger' : 'My Children\'s Balances'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isAdmin ? 'Monitor and record pupil fee transactions' : 'Individual balance breakdown for your children.'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <>
                  <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                    <DialogTrigger asChild>
                      <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-1.5 h-8 text-xs font-bold shadow-sm">
                        <Settings2 className="h-3.5 w-3.5 text-teal-600" /> Fee Setup
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Termly Fee Configuration</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-5 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Select Term</Label>
                            <Select value={feeTerm} onValueChange={setFeeTerm}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Term 1">Term 1</SelectItem>
                                <SelectItem value="Term 2">Term 2</SelectItem>
                                <SelectItem value="Term 3">Term 3</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Fee Amount ({currencySymbol})</Label>
                            <Input type="number" placeholder="0.00" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Apply to Grades</Label>
                          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                            {GRADES.map(grade => (
                              <div key={grade} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => toggleGrade(grade)}>
                                <Checkbox checked={selectedGrades.includes(grade)} onCheckedChange={() => toggleGrade(grade)} />
                                <span className="text-[11px] font-medium text-gray-700">{grade}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button disabled={isSubmitting || selectedGrades.length === 0 || !feeAmount} onClick={handleApplyFees} className="w-full bg-teal-600">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Post Bulk Billing
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
                    <DialogTrigger asChild>
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 flex items-center gap-1.5 h-8 text-xs font-bold shadow-sm">
                        <Plus className="h-3.5 w-3.5" /> Record Payment
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handlePayment}>
                        <DialogHeader><DialogTitle>Process Fee Payment</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                          <Label>Select Student</Label>
                          <Select name="studentId" required>
                            <SelectTrigger><SelectValue placeholder="Search student..." /></SelectTrigger>
                            <SelectContent>
                              {students.map(s => <SelectItem key={s.id} value={s.id}>{s.studentName} ({s.grade})</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Label>Amount to Pay ({currencySymbol})</Label>
                          <Input name="amount" type="number" step="0.01" required />
                          <Label>Payment Method</Label>
                          <Select name="method" defaultValue="Bank Transfer">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                              <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                              <SelectItem value="Cash">Cash</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600">Confirm Payment</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isAdmin && (
              <div className="px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input placeholder="Filter list..." className="pl-9 h-9 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 border-y border-gray-100 font-bold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Pupil</th>
                    <th className="px-4 py-3 Grade">Grade</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.filter(s => s.studentName?.toLowerCase().includes(search.toLowerCase())).map((student) => {
                    const balance = parseFloat(student.feeBalance as any) || 0;
                    return (
                      <tr key={student.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-gray-800">{student.studentName}</td>
                        <td className="px-4 py-3 text-gray-500">{student.grade}</td>
                        <td className={`px-4 py-3 text-right font-bold ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {currencySymbol}{balance.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${balance > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {balance > 0 ? 'Partial' : 'Paid'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-400 italic">No student records found linked to your account.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-emerald-100 shadow-sm bg-emerald-50/20">
            <CardHeader><CardTitle className="text-sm font-bold text-emerald-800">Financial Intelligence</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-emerald-50 flex gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  {isAdmin 
                    ? `Total collection rate stands at ${stats?.collectionRate}% for the current academic session.`
                    : `Your current family settlement rate is ${stats?.collectionRate}% against total billed amounts.`}
                </p>
              </div>
              {!isAdmin && (
                <div className="p-3 bg-white rounded-lg border border-emerald-50 flex gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-[10px] text-gray-600 leading-relaxed">
                    To make a payment, please use the registered bank details or contact the accounts office.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FinanceMetricCard({ label, value, trend, icon, color, isPositive = true }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shadow-sm`}>{icon}</div>
        <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>{trend}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{label}</p>
    </div>
  );
}
