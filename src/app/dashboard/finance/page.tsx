
"use client"

import { useState, useMemo } from 'react';
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
import { 
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
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
import { Student, Transaction } from '@/lib/types';

const COLORS = ['#0D9488', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6'];
const GRADES = ['Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];

export default function FinanceBillingPage() {
  const database = useDatabase();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  
  const { data: students, loading: studentsLoading } = useRTDBCollection<Student>(database, 'students');
  const { data: transactions, loading: txLoading } = useRTDBCollection<Transaction>(database, 'transactions');
  const { data: schoolSettings } = useRTDBDoc(database, 'system_settings');
  
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

  const stats = useMemo(() => {
    if (loading || !students || !transactions) return null;

    const totalPaid = transactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);
    const totalArrears = students.reduce((acc, s) => acc + (parseFloat(s.feeBalance as any) || 0), 0);
    const totalBilled = totalPaid + totalArrears;
    const debtorCount = students.filter(s => (parseFloat(s.feeBalance as any) || 0) > 0).length;
    const collectionRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0;

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    const currentWeekPaid = transactions
      .filter(tx => (tx.timestamp as number) > weekAgo)
      .reduce((acc, tx) => acc + (tx.amount || 0), 0);
    
    const lastWeekPaid = transactions
      .filter(tx => (tx.timestamp as number) > twoWeeksAgo && (tx.timestamp as number) <= weekAgo)
      .reduce((acc, tx) => acc + (tx.amount || 0), 0);

    const growth = lastWeekPaid > 0 
      ? ((currentWeekPaid - lastWeekPaid) / lastWeekPaid) * 100 
      : currentWeekPaid > 0 ? 100 : 0;

    return {
      arrears: totalArrears.toLocaleString(),
      debtors: debtorCount,
      totalBilled: totalBilled.toLocaleString(),
      collectionRate: collectionRate.toFixed(1),
      growth: growth.toFixed(1),
      unpaidPct: totalBilled > 0 ? ((totalArrears / totalBilled) * 100).toFixed(1) : '0.0'
    };
  }, [students, transactions, loading]);

  const paymentMethodsData = useMemo(() => {
    if (loading || !transactions) return [];
    const counts: Record<string, number> = {};
    transactions.forEach(tx => {
      const method = tx.method || 'Other';
      counts[method] = (counts[method] || 0) + (tx.amount || 0);
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [transactions, loading]);

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
      toast({ title: "Validation Error", description: "Please fill all fields and select at least one grade.", variant: "destructive" });
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
      setFeeAmount('');
      setSelectedGrades([]);
      toast({ 
        title: "Fees Applied", 
        description: `Successfully billed ${count} students for ${feeTerm}.` 
      });
    } catch (e) {
      toast({ title: "Action Failed", description: "Failed to apply bulk fees.", variant: "destructive" });
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
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="50" r="120" fill="white" />
            <circle cx="50" cy="180" r="80" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Finance & School Billing</h2>
            <p className="text-sm text-white/80 mt-1">Real-time fee tracking, payment processing, and financial analytics</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3 h-3" /> RTDB Ledger Active
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceMetricCard 
          label="Total Billed" 
          value={loading ? '...' : `${currencySymbol}${stats?.totalBilled}`} 
          trend={`${stats?.growth}% growth`} 
          icon={<CreditCard className="w-4 h-4 text-blue-600" />} 
          color="bg-blue-50" 
          isPositive={parseFloat(stats?.growth || '0') >= 0} 
        />
        <FinanceMetricCard 
          label="Outstanding" 
          value={loading ? '...' : `${currencySymbol}${stats?.arrears}`} 
          trend={`${stats?.unpaidPct}% of total`} 
          icon={<Wallet className="w-4 h-4 text-amber-600" />} 
          color="bg-amber-50" 
          isPositive={false} 
        />
        <FinanceMetricCard 
          label="Collection Rate" 
          value={loading ? '...' : `${stats?.collectionRate}%`} 
          trend="Real-time target: 90%" 
          icon={<TrendingUp className="w-4 h-4 text-emerald-600" />} 
          color="bg-emerald-50" 
          isPositive={parseFloat(stats?.collectionRate || '0') >= 80} 
        />
        <FinanceMetricCard 
          label="Active Debtors" 
          value={loading ? '...' : stats?.debtors.toString() || '0'} 
          trend={`${students.length > 0 ? ((stats?.debtors || 0) / students.length * 100).toFixed(1) : 0}% of pupils`} 
          icon={<Users className="w-4 h-4 text-rose-600" />} 
          color="bg-rose-50" 
          isPositive={false} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-gray-50 mb-4">
            <div>
              <CardTitle className="text-sm font-bold text-gray-800">Student Ledger & Payments</CardTitle>
              <CardDescription className="text-xs">Search pupils and record manual fee payments</CardDescription>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                  <DialogTrigger asChild>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-1.5 h-8 text-xs font-bold transition-all shadow-sm">
                      <Settings2 className="h-3.5 w-3.5 text-teal-600" /> Fee Setup
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Termly Fee Configuration</DialogTitle>
                      <CardDescription>Define fees for the term and apply them to specific grades.</CardDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Term</Label>
                          <Select value={feeTerm} onValueChange={setFeeTerm}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Term 1">Term 1</SelectItem>
                              <SelectItem value="Term 2">Term 2</SelectItem>
                              <SelectItem value="Term 3">Term 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fee Amount ({currencySymbol})</Label>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            value={feeAmount} 
                            onChange={(e) => setFeeAmount(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Apply to Grades</Label>
                          <button 
                            onClick={() => setSelectedGrades(selectedGrades.length === GRADES.length ? [] : [...GRADES])}
                            className="text-[9px] font-bold text-teal-600 hover:underline uppercase"
                          >
                            {selectedGrades.length === GRADES.length ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                          {GRADES.map(grade => (
                            <div 
                              key={grade} 
                              className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => toggleGrade(grade)}
                            >
                              <Checkbox checked={selectedGrades.includes(grade)} onCheckedChange={() => toggleGrade(grade)} />
                              <span className="text-[11px] font-medium text-gray-700">{grade}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedGrades.length > 0 && feeAmount && (
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-amber-800 leading-relaxed">
                            This will add <span className="font-bold">{currencySymbol}{feeAmount}</span> to the balance of every student in the <span className="font-bold">{selectedGrades.length}</span> selected grades. This action is irreversible.
                          </p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button 
                        disabled={isSubmitting || selectedGrades.length === 0 || !feeAmount} 
                        onClick={handleApplyFees}
                        className="w-full bg-teal-600 hover:bg-teal-700 font-bold"
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                        Apply Bulk Fees
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
                <DialogTrigger asChild>
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 flex items-center gap-1.5 h-8 text-xs font-bold transition-all shadow-sm">
                    <Plus className="h-3.5 w-3.5" /> Record Payment
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handlePayment}>
                    <DialogHeader>
                      <DialogTitle>Process Fee Payment</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Select Student</Label>
                        <Select name="studentId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Search student..." />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.studentName} ({s.grade}) — Bal: {currencySymbol}{s.feeBalance}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Amount to Pay ({currencySymbol})</Label>
                        <Input name="amount" type="number" step="0.01" placeholder="0.00" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select name="method" defaultValue="Bank Transfer">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="POS/Card">Card (POS)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Post Payment
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input 
                  placeholder="Filter student list..." 
                  className="pl-9 h-9 text-xs border-gray-200 focus:ring-emerald-500" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <p className="text-xs text-gray-400 italic font-medium">Syncing Ledger...</p>
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-100 text-left text-gray-500">
                      <th className="px-4 py-3 font-bold uppercase tracking-tighter">Student Details</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-tighter">Grade</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-tighter text-right">Fee Balance</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-tighter text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {students.filter(s => s.studentName?.toLowerCase().includes(search.toLowerCase())).map((student) => {
                      const balance = parseFloat(student.feeBalance as any) || 0;
                      return (
                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-gray-800">
                            {student.studentName}
                            <div className="text-[9px] text-gray-400 font-medium">
                              {student.lastBillingTerm ? `Last billed: ${student.lastBillingTerm}` : 'No term history'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 font-medium">{student.grade}</td>
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
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Revenue Mix</CardTitle>
              <CardDescription className="text-xs">Unfiltered payment channel distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                {paymentMethodsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentMethodsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #eee' }} />
                      <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                    <Activity className="h-8 w-8 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No Transactions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 shadow-sm bg-emerald-50/20 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-emerald-800">Financial Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 p-2 bg-white rounded-lg border border-emerald-50 shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                <p className="text-[10px] text-gray-600 leading-relaxed font-medium">
                  Collection Rate is at <span className="font-bold text-emerald-600">{stats?.collectionRate}%</span>. Keep reaching out to the <span className="font-bold text-rose-600">{stats?.debtors}</span> active debtors.
                </p>
              </div>
              <div className="flex items-start gap-2 p-2 bg-white rounded-lg border border-emerald-50 shadow-sm">
                <ArrowDownRight className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                <p className="text-[10px] text-gray-600 leading-relaxed font-medium">
                  Total outstanding arrears currently stand at <span className="font-bold text-amber-600">{currencySymbol}{stats?.arrears}</span>. This is <span className="font-bold">{stats?.unpaidPct}%</span> of the terminal billing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FinanceMetricCard({ label, value, trend, icon, color, isPositive }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group cursor-default">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
          {icon}
        </div>
        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
          {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
          {trend}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
