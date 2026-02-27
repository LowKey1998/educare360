
"use client"

import { useState } from 'react';
import { 
  UtensilsCrossed, 
  Download, 
  Plus, 
  Users, 
  DollarSign, 
  TrendingUp, 
  CircleAlert, 
  Coffee, 
  Cookie, 
  Search, 
  Calendar, 
  Eye, 
  PenLine, 
  Copy, 
  Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MealsCateringPage() {
  const [activeTab, setActiveTab] = useState('meal-plans');

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            Meals & Catering Management
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage meal plans, subscriptions, daily attendance, billing, and ECD nutrition tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1.5 h-9 text-xs font-medium text-gray-600 bg-white border-gray-200 hover:bg-gray-50">
            <Download className="h-3.5 w-3.5" /> Export Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Total Subscribers" 
          value="148" 
          trend="+12" 
          icon={<Users className="h-4.5 w-4.5 text-blue-600" />} 
          color="bg-blue-50" 
        />
        <MetricCard 
          label="Today's Meal Count" 
          value="312" 
          trend="+5%" 
          icon={<UtensilsCrossed className="h-4.5 w-4.5 text-green-600" />} 
          color="bg-green-50" 
        />
        <MetricCard 
          label="Monthly Revenue" 
          value="$11,280" 
          trend="+8%" 
          icon={<DollarSign className="h-4.5 w-4.5 text-purple-600" />} 
          color="bg-purple-50" 
        />
        <MetricCard 
          label="Dietary Restrictions" 
          value="18" 
          trend="+2" 
          icon={<CircleAlert className="h-4.5 w-4.5 text-amber-600" />} 
          color="bg-amber-50" 
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Tabs defaultValue="meal-plans" className="w-full">
          <div className="flex border-b border-gray-100 px-2 overflow-x-auto custom-scrollbar">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger 
                value="meal-plans" 
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" /> Meal Plans
              </TabsTrigger>
              <TabsTrigger 
                value="subscriptions" 
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent"
              >
                <Users className="w-3.5 h-3.5" /> Subscriptions
              </TabsTrigger>
              <TabsTrigger 
                value="attendance" 
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent"
              >
                <Coffee className="w-3.5 h-3.5" /> Daily Attendance
              </TabsTrigger>
              <TabsTrigger 
                value="billing" 
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent"
              >
                <DollarSign className="w-3.5 h-3.5" /> Billing
              </TabsTrigger>
              <TabsTrigger 
                value="nutrition" 
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent"
              >
                <Cookie className="w-3.5 h-3.5" /> ECD Nutrition
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-5">
            <TabsContent value="meal-plans" className="m-0 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex flex-1 gap-3 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input 
                      placeholder="Search meal plans..." 
                      className="pl-9 text-xs h-9 border-gray-200 focus:ring-1 focus:ring-teal-500 outline-none" 
                    />
                  </div>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                    <button className="px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors bg-white text-gray-800 shadow-sm">All</button>
                    <button className="px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors text-gray-500">Active</button>
                    <button className="px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors text-gray-500">Draft</button>
                    <button className="px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors text-gray-500">Archived</button>
                  </div>
                </div>
                <Button className="flex items-center gap-1.5 h-9 px-4 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm">
                  <Plus className="h-3.5 w-3.5" /> New Meal Plan
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <MealPlanCard 
                  title="Term 1 Standard Menu" 
                  id="MP-001" 
                  status="Active" 
                  dateRange="2026-01-12 to 2026-04-03" 
                  schedule={[
                    { day: 'Mon', meal: 'Sadza, beef stew & vegetables' },
                    { day: 'Tue', meal: 'Rice, chicken & coleslaw' },
                    { day: 'Wed', meal: 'Pasta bolognese & salad' },
                  ]}
                />
                <MealPlanCard 
                  title="Term 1 ECD Special Menu" 
                  id="MP-002" 
                  status="Active" 
                  dateRange="2026-01-12 to 2026-04-03" 
                  schedule={[
                    { day: 'Mon', meal: 'Mashed potato & minced beef' },
                    { day: 'Tue', meal: 'Rice pudding & chicken soup' },
                    { day: 'Wed', meal: 'Macaroni cheese & peas' },
                  ]}
                />
                <MealPlanCard 
                  title="Term 2 Draft Menu" 
                  id="MP-003" 
                  status="Draft" 
                  dateRange="2026-05-04 to 2026-08-07" 
                  schedule={[
                    { day: 'Mon', meal: 'Sadza, beef stew & vegetables' },
                    { day: 'Tue', meal: 'Rice, chicken & coleslaw' },
                    { day: 'Wed', meal: 'Pasta bolognese & salad' },
                  ]}
                />
              </div>
            </TabsContent>

            <TabsContent value="subscriptions" className="p-8 text-center text-muted-foreground italic text-sm">
              Subscription management interface loading...
            </TabsContent>
            <TabsContent value="attendance" className="p-8 text-center text-muted-foreground italic text-sm">
              Daily catering attendance tracking...
            </TabsContent>
            <TabsContent value="billing" className="p-8 text-center text-muted-foreground italic text-sm">
              Catering billing and invoice module...
            </TabsContent>
            <TabsContent value="nutrition" className="p-8 text-center text-muted-foreground italic text-sm">
              Nutrition analytics and allergy management...
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow group">
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${color} ${icon.props.className.split(' ').find((c: string) => c.startsWith('text-'))}`}>{label}</span>
        <span className="text-[10px] font-medium flex items-center gap-0.5 text-green-600">
          <TrendingUp className="w-2.5 h-2.5" /> {trend}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MealPlanCard({ title, id, status, dateRange, schedule }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">{title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{id} | Term 1 2026</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
            status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {status}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <Calendar className="h-3 w-3" />
          <span>{dateRange}</span>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        {schedule.map((item: any, idx: number) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-[10px] font-medium text-gray-500 w-12 shrink-0">{item.day}</span>
            <p className="text-[10px] text-gray-600 truncate">{item.meal}</p>
          </div>
        ))}
        <p className="text-[10px] text-gray-400 italic pt-1">+2 more days...</p>
      </div>
      <div className="px-3 py-2 bg-gray-50 flex items-center gap-1 justify-end">
        <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-teal-600 transition-colors" title="View">
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
          <PenLine className="h-3.5 w-3.5" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-purple-600 transition-colors" title="Duplicate">
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button className="px-2 py-1 rounded-lg text-[10px] font-medium hover:bg-white text-gray-500 transition-colors">
          {status === 'Active' ? 'Deactivate' : 'Activate'}
        </button>
        <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-red-600 transition-colors" title="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
