
"use client"

import { useState } from 'react';
import { 
  Download, 
  Plus, 
  Database, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown,
  PieChart as PieChartIcon,
  BarChart3,
  CreditCard,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const collectionData = [
  { name: 'Jan', Collected: 22000, Target: 32000 },
  { name: 'Feb', Collected: 28000, Target: 32000 },
  { name: 'Mar', Collected: 25000, Target: 32000 },
  { name: 'Apr', Collected: 24000, Target: 32000 },
  { name: 'May', Collected: 30000, Target: 32000 },
  { name: 'Jun', Collected: 31000, Target: 32000 },
];

const paymentMethodsData = [
  { name: 'Bank Transfer', value: 45, color: '#0D9488' },
  { name: 'Mobile Money', value: 30, color: '#8B5CF6' },
  { name: 'Cash', value: 15, color: '#F59E0B' },
  { name: 'POS', value: 10, color: '#EF4444' },
];

export default function FinanceBillingPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Finance & School Billing
            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[9px] font-semibold rounded-full flex items-center gap-1">
              <Database className="h-2.5 w-2.5" /> Server Query
            </span>
          </h2>
          <p className="text-xs text-gray-500">Manage fees, invoices, payments with server-side search and filtering</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Button variant="outline" className="flex items-center gap-1.5 h-9 text-xs font-medium text-gray-600 bg-white border-gray-200 hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
          <Button className="flex items-center gap-1.5 h-9 px-4 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm">
            <Plus className="h-3.5 w-3.5" /> Record Payment
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceMetricCard 
          label="Total Billed" 
          value="$142,500" 
          subValue="412 invoices" 
          color="bg-blue-50 text-blue-600" 
          trend="+12% vs last term"
          isPositive={true}
        />
        <FinanceMetricCard 
          label="Collected" 
          value="$118,200" 
          subValue="82.9% collection rate" 
          color="bg-green-50 text-green-600" 
          trend="+5.4% YoY"
          isPositive={true}
        />
        <FinanceMetricCard 
          label="Outstanding" 
          value="$24,300" 
          subValue="68 unpaid invoices" 
          color="bg-amber-50 text-amber-600" 
          trend="-2.1% from last month"
          isPositive={true}
        />
        <FinanceMetricCard 
          label="Overdue" 
          value="$8,450" 
          subValue="Needs follow-up" 
          color="bg-red-50 text-red-600" 
          trend="+430 since Mon"
          isPositive={false}
        />
      </div>

      {/* Main Content Area */}
      <Card className="border-gray-100 overflow-hidden">
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b border-gray-100 px-4 pt-1 bg-white">
            <TabsList className="bg-transparent h-auto p-0 gap-4">
              <TabsTrigger 
                value="overview" 
                className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 rounded-none shadow-none"
              >
                Financial Overview
              </TabsTrigger>
              <TabsTrigger 
                value="invoices" 
                className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 rounded-none shadow-none"
              >
                Invoices & Billing
              </TabsTrigger>
              <TabsTrigger 
                value="records" 
                className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 rounded-none shadow-none"
              >
                Payment Records
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-5 mt-0 outline-none">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Collection Chart */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-800">Collection vs Target</h4>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={collectionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} tickFormatter={(v) => `$${v/1000}k`} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                        />
                        <Bar dataKey="Collected" fill="#0D9488" radius={[4, 4, 0, 0]} barSize={14} name="Collected" />
                        <Bar dataKey="Target" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={14} name="Target" />
                        <Legend verticalAlign="bottom" align="center" iconType="rect" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Payment Methods Chart */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-800">Payment Methods</h4>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="h-[200px] w-full md:w-1/2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentMethodsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {paymentMethodsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2.5 w-full">
                      {paymentMethodsData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2 text-[11px]">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600 flex-1">{item.name}</span>
                          <span className="text-gray-800 font-bold">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Aging Report */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <h4 className="text-sm font-semibold text-gray-800">Debtors Aging Report</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <AgingCard label="Current" amount="$18,200" count="45 pupils" color="bg-green-500" />
                  <AgingCard label="30 Days" amount="$22,080" count="32 pupils" color="bg-amber-500" />
                  <AgingCard label="60 Days" amount="$12,550" count="18 pupils" color="bg-orange-500" />
                  <AgingCard label="90+ Days" amount="$8,450" count="8 pupils" color="bg-red-500" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="p-8 text-center text-muted-foreground italic text-sm">
            Invoice generation and management system loading...
          </TabsContent>
          
          <TabsContent value="records" className="p-8 text-center text-muted-foreground italic text-sm">
            Transactional payment history and receipt management...
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function FinanceMetricCard({ label, value, subValue, color, trend, isPositive }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${color}`}>{label}</span>
        <span className={`text-[10px] font-medium flex items-center gap-0.5 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
          {trend}
        </span>
      </div>
      <div className="flex items-end justify-between mt-3">
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">{subValue}</p>
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color.split(' ')[0]}`}>
          <DollarSign className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function AgingCard({ label, amount, count, color }: any) {
  return (
    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 text-center hover:bg-white hover:shadow-sm transition-all group">
      <div className={`w-2 h-2 rounded-full ${color} mx-auto mb-2 shadow-sm`} />
      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-gray-800 mt-1">{amount}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{count}</p>
    </div>
  );
}
