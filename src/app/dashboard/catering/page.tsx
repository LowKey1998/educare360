
"use client"

import { useState, useMemo } from 'react';
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
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDatabase, useRTDBCollection } from '@/firebase';
import { ref, push, remove, serverTimestamp } from 'firebase/database';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function MealsCateringPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: mealPlans, loading } = useRTDBCollection(database, 'meal_plans');

  const filteredPlans = useMemo(() => {
    return mealPlans.filter((p: any) => 
      p.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [mealPlans, search]);

  const handleAddMealPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      id: `MP-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Active',
      dateRange: formData.get('range'),
      schedule: [
        { day: 'Mon', meal: formData.get('mon') },
        { day: 'Tue', meal: formData.get('tue') },
        { day: 'Wed', meal: formData.get('wed') },
      ],
      createdAt: serverTimestamp()
    };

    try {
      await push(ref(database, 'meal_plans'), data);
      setIsAddOpen(false);
      toast({ title: "Meal Plan Created", description: `Added "${data.title}" successfully.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to save plan.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meal plan?')) return;
    await remove(ref(database, `meal_plans/${id}`));
    toast({ title: "Deleted", description: "Meal plan removed." });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            Meals & Catering Management
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage meal plans, nutrition tracking, and catering operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 text-xs gap-1.5" onClick={() => toast({ title: "Export Started", description: "Downloading menu data..." })}>
            <Download className="h-3.5 w-3.5" /> Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Subscribers" value="148" trend="+12" icon={<Users className="h-4.5 w-4.5 text-blue-600" />} color="bg-blue-50" />
        <MetricCard label="Today's Meal Count" value="312" trend="+5%" icon={<UtensilsCrossed className="h-4.5 w-4.5 text-green-600" />} color="bg-green-50" />
        <MetricCard label="Monthly Revenue" value="$11,280" trend="+8%" icon={<DollarSign className="h-4.5 w-4.5 text-purple-600" />} color="bg-purple-50" />
        <MetricCard label="Dietary Restrictions" value="18" trend="+2" icon={<CircleAlert className="h-4.5 w-4.5 text-amber-600" />} color="bg-amber-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Tabs defaultValue="meal-plans" className="w-full">
          <div className="flex border-b border-gray-100 px-2 overflow-x-auto custom-scrollbar">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger value="meal-plans" className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none">Meal Plans</TabsTrigger>
              <TabsTrigger value="subscriptions" className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none">Subscriptions</TabsTrigger>
              <TabsTrigger value="nutrition" className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none">ECD Nutrition</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-5">
            <TabsContent value="meal-plans" className="m-0 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input 
                    placeholder="Search meal plans..." 
                    className="pl-9 text-xs h-9 border-gray-200" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-1.5 h-9 px-4 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700">
                      <Plus className="h-3.5 w-3.5" /> New Meal Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddMealPlan}>
                      <DialogHeader>
                        <DialogTitle>Create Terminal Meal Plan</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Plan Title</Label>
                          <Input name="title" placeholder="e.g. Term 1 Standard Menu" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Date Range</Label>
                          <Input name="range" placeholder="Jan - Apr 2026" required />
                        </div>
                        <div className="grid grid-cols-1 gap-3 border-t pt-3">
                          <Label className="font-bold text-[10px] uppercase">Daily Samples (First 3 Days)</Label>
                          <Input name="mon" placeholder="Monday Meal" required />
                          <Input name="tue" placeholder="Tuesday Meal" required />
                          <Input name="wed" placeholder="Wednesday Meal" required />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Saving..." : "Save Meal Plan"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
                  <p className="text-xs text-gray-400 italic">Syncing menus...</p>
                </div>
              ) : filteredPlans.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredPlans.map((plan: any) => (
                    <MealPlanCard key={plan.id} plan={plan} onDelete={() => handleDelete(plan.id)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 italic text-xs">No meal plans found.</div>
              )}
            </TabsContent>
            <TabsContent value="subscriptions" className="p-12 text-center text-gray-400 italic text-xs">Subscription module syncing...</TabsContent>
            <TabsContent value="nutrition" className="p-12 text-center text-gray-400 italic text-xs">Nutritional analytics loading...</TabsContent>
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
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${color}`}>{label}</span>
        <span className="text-[10px] font-medium flex items-center gap-0.5 text-green-600">
          <TrendingUp className="w-2.5 h-2.5" /> {trend}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

function MealPlanCard({ plan, onDelete }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">{plan.title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{plan.id}</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
            {plan.status || 'Active'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <Calendar className="h-3 w-3" />
          <span>{plan.dateRange}</span>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        {(plan.schedule || []).map((item: any, idx: number) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-[10px] font-medium text-gray-500 w-12 shrink-0">{item.day}</span>
            <p className="text-[10px] text-gray-600 truncate">{item.meal}</p>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 bg-gray-50 flex items-center gap-1 justify-end">
        <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-teal-600 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
        <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-blue-600 transition-colors"><PenLine className="h-3.5 w-3.5" /></button>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}
