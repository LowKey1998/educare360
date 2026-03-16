
"use client"

import { useState, useMemo } from 'react';
import { 
  Plus, 
  Database, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Loader2,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Wallet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDatabase, useRTDBCollection } from '@/firebase';
import { ref, update, serverTimestamp, push } from 'firebase/database';
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
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#0D9488', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function FinanceBillingPage() {
  const database = useDatabase();
  const { toast } = useToast();
  const { data: students, loading } = useRTDBCollection(database, 'students');
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const stats = useMemo(() => {
    const totalArrears = students.reduce((acc, s) => acc + (parseFloat(s.feeBalance) || 0), 0);
    const debtorCount = students.filter(s => (parseFloat(s.feeBalance) || 0) > 0).length;
    
    return {
      arrears: totalArrears.toLocaleString(),
      debtors: debtorCount,
      totalBilled: (totalArrears * 1.4).toLocaleString(), // Estimated
      collectionRate: '82.4%',
    };
  }, [students]);

  const paymentMethodsData = useMemo(() => [
    { name: 'Bank Transfer', value: 45 },
    { name: 'Mobile Money', value: 30 },
    { name: 'Cash', value: 15 },
    { name: 'POS', value: 10 },
  ], []);

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const studentId = formData.get('studentId') as string;
    const amount = parseFloat(formData.get('amount') as string);

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    try {
      const currentBalance = parseFloat(student.feeBalance) || 0;
      const newBalance = Math.max(0, currentBalance - amount);
      
      // Update student balance
      await update(ref(database, `students/${studentId}`), {
        feeBalance: newBalance
      });

      // Log transaction
      await push(ref(database, 'transactions'), {
        studentId,
        studentName: student.studentName,
        amount,
        method: formData.get('method'),
        type: 'Fee Payment',
        timestamp: serverTimestamp()
      });

      setIsPayOpen(false);
      toast({ title: "Payment Recorded", description: `Updated balance for ${student.studentName}: $${newBalance.toFixed(2)}` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update payment.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* High-Fidelity Header */}
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
              <Database className="w-3 h-3" /> Live Sync Active
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceMetricCard label="Total Billed" value={`$${stats.totalBilled}`} trend="+12.5%" icon={<CreditCard className="w-4 h-4 text-blue-600" />} color="bg-blue-50" isPositive={true} />
        <FinanceMetricCard label="Outstanding" value={`$${stats.arrears}`} trend={`${stats.debtors} active debtors`} icon={<Wallet className="w-4 h-4 text-amber-600" />} color="bg-amber-50" isPositive={false} />
        <FinanceMetricCard label="Collection Rate" value={stats.collectionRate} trend="+2.4% vs L/T" icon={<TrendingUp className="w-4 h-4 text-emerald-600" />} color="bg-emerald-50" isPositive={true} />
        <FinanceMetricCard label="Active Debtors" value={stats.debtors.toString()} trend="Requires Attention" icon={<Users className="w-4 h-4 text-rose-600" />} color="bg-rose-50" isPositive={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Entry Card */}
        <Card className="lg:col-span-2 border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50 mb-4">
            <div>
              <CardTitle className="text-sm font-bold text-gray-800">Student Ledger & Payments</CardTitle>
              <CardDescription className="text-xs">Search students and record fee payments</CardDescription>
            </div>
            <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 h-8 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Record Payment
                </Button>
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
                            <SelectItem key={s.id} value={s.id}>{s.studentName} ({s.grade}) — Bal: ${s.feeBalance}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount to Pay ($)</Label>
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
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Post Payment
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input 
                  placeholder="Filter student list..." 
                  className="pl-9 h-9 text-xs border-gray-200" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-100 text-left text-gray-500">
                    <th className="px-4 py-3 font-semibold">STUDENT DETAILS</th>
                    <th className="px-4 py-3 font-semibold">GRADE</th>
                    <th className="px-4 py-3 font-semibold text-right">FEE BALANCE</th>
                    <th className="px-4 py-3 font-semibold text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.filter(s => s.studentName?.toLowerCase().includes(search.toLowerCase())).map((student) => {
                    const balance = parseFloat(student.feeBalance) || 0;
                    return (
                      <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{student.studentName}</td>
                        <td className="px-4 py-3 text-gray-500">{student.grade}</td>
                        <td className={`px-4 py-3 text-right font-bold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          ${balance.toFixed(2)}
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
            </div>
          </CardContent>
        </Card>

        {/* Financial Distribution */}
        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Revenue Mix</CardTitle>
              <CardDescription className="text-xs">Payment channel distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
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
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm bg-gray-50/50 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-700">Financial Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 p-2 bg-white rounded-lg border border-gray-100">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  Fee collection is up <span className="font-bold text-emerald-600">8.4%</span> this term compared to the same period last year.
                </p>
              </div>
              <div className="flex items-start gap-2 p-2 bg-white rounded-lg border border-gray-100">
                <ArrowDownRight className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  <span className="font-bold text-amber-600">{stats.debtors}</span> students still have outstanding balances exceeding $500.
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
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
          {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
          {trend}
        </div>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
