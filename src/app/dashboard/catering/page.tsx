
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
  Loader2,
  Database,
  ChefHat,
  Leaf
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
        { day: 'Thu', meal: formData.get('thu') || 'Standard Lunch' },
        { day: 'Fri', meal: formData.get('fri') || 'Standard Lunch' },
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
    if (!confirm('Delete this meal plan? All linked subscriptions will be notified.')) return;
    try {
      await remove(ref(database, `meal_plans/${id}`));
      toast({ title: "Deleted", description: "Meal plan removed from system." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete plan." });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* High-Fidelity Header */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="50" r="120" fill="white" />
            <circle cx="50" cy="180" r="80" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Meals & Catering Management</h2>
            <p className="text-sm text-white/80 mt-1">Manage menus, nutrition tracking, and student dietary requirements</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <ChefHat className="w-3.5 h-3.5" /> Kitchen Status: Normal
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CateringMetricCard label="Subscribers" value="148" trend="+12" icon={<Users className="h-4.5 w-4.5 text-blue-600" />} color="bg-blue-50" />
        <CateringMetricCard label="Today's Count" value="312" trend="+5%" icon={<UtensilsCrossed className="h-4.5 w-4.5 text-green-600" />} color="bg-green-50" />
        <CateringMetricCard label="Monthly Revenue" value="$11,280" trend="+8%" icon={<DollarSign className="h-4.5 w-4.5 text-purple-600" />} color="bg-purple-50" />
        <CateringMetricCard label="Dietary Alerts" value="18" trend="+2" icon={<CircleAlert className="h-4.5 w-4.5 text-amber-600" />} color="bg-amber-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Tabs defaultValue="meal-plans" className="w-full">
          <div className="flex border-b border-gray-100 px-2 overflow-x-auto bg-white sticky top-0 z-10">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger value="meal-plans" className="px-4 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 rounded-none bg-transparent">Meal Plans</TabsTrigger>
              <TabsTrigger value="subscriptions" className="px-4 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 rounded-none bg-transparent">Subscriptions</TabsTrigger>
              <TabsTrigger value="nutrition" className="px-4 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 rounded-none bg-transparent">Nutrition Tracking</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-5">
            <TabsContent value="meal-plans" className="m-0 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input 
                    placeholder="Search menus and terminal plans..." 
                    className="pl-9 h-9 text-xs border-gray-200 focus:ring-orange-100" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-9 px-4 text-xs font-bold bg-orange-600 hover:bg-orange-700 gap-1.5 shadow-sm">
                      <Plus className="h-3.5 w-3.5" /> New Meal Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <form onSubmit={handleAddMealPlan}>
                      <DialogHeader>
                        <DialogTitle>Define Terminal Menu</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Plan Title</Label>
                          <Input name="title" placeholder="e.g. Term 1 Standard Menu" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Validity Period</Label>
                          <Input name="range" placeholder="Jan 2026 - Apr 2026" required />
                        </div>
                        <div className="grid grid-cols-1 gap-3 border-t pt-4">
                          <Label className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Weekly Cycle (Samples)</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[10px]">MONDAY</Label>
                              <Input name="mon" placeholder="e.g. Sadza & Beef" required />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">TUESDAY</Label>
                              <Input name="tue" placeholder="e.g. Rice & Chicken" required />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">WEDNESDAY</Label>
                              <Input name="wed" placeholder="e.g. Spaghetti Bolognese" required />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">THURSDAY</Label>
                              <Input name="thu" placeholder="e.g. Beans & Potato" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-600">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Save Terminal Plan
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                  <p className="text-xs text-gray-400 italic">Syncing kitchen records...</p>
                </div>
              ) : filteredPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredPlans.map((plan: any) => (
                    <div key={plan.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                      <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate pr-4">{plan.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 uppercase tracking-tight">
                              <Database className="h-2.5 w-2.5" /> {plan.id}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                            {plan.status || 'Active'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                          <Calendar className="h-3 w-3 text-orange-500" />
                          <span>{plan.dateRange}</span>
                        </div>
                      </div>
                      <div className="p-4 space-y-2.5">
                        {(plan.schedule || []).map((item: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="text-[10px] font-bold text-gray-400 w-8 shrink-0">{item.day}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-gray-700 truncate font-medium">{item.meal}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-3 py-2 bg-gray-50 flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-orange-600 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-blue-600 transition-colors"><PenLine className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(plan.id)} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-rose-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <UtensilsCrossed className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No meal plans configured.</p>
                  <p className="text-xs text-gray-300 mt-1">Start by defining a menu for the current terminal session.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="subscriptions" className="py-20 text-center text-gray-400 italic text-xs">
              Subscription module requires Finance API connection...
            </TabsContent>
            <TabsContent value="nutrition" className="py-20 text-center text-gray-400 italic text-xs">
              Nutritional analysis pending health record sync...
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function CateringMetricCard({ label, value, trend, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-0.5">
          <TrendingUp className="w-2.5 h-2.5 text-emerald-500" /> {trend}
        </span>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
