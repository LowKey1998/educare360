
"use client"

import { useState, useMemo } from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  Users, 
  DollarSign, 
  TrendingUp, 
  CircleAlert, 
  Search, 
  Calendar, 
  Trash2,
  Loader2,
  Database,
  ChefHat,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDatabase, useRTDBCollection, useUserProfile } from '@/firebase';
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
import { operationsService } from '@/services/operations';
import { studentService } from '@/services/students';
import { MealPlan, Student } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';

export default function MealsCateringPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDietaryOpen, setIsDietaryOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const { data: mealPlans, loading: plansLoading } = useRTDBCollection<MealPlan>(database, 'meal_plans');
  const { data: students, loading: studentsLoading } = useRTDBCollection<Student>(database, 'students');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';

  const stats = useMemo(() => {
    const subscribed = students.filter(s => s.isCateringSubscribed).length;
    const dietaryAlerts = students.filter(s => s.dietaryRequirements && s.dietaryRequirements.length > 0).length;
    return {
      subscribers: subscribed,
      todayCount: subscribed, // Simplification for today's forecast
      revenue: (subscribed * 45).toLocaleString(), // Estimated revenue at $45/term
      alerts: dietaryAlerts
    };
  }, [students]);

  const filteredPlans = useMemo(() => {
    return mealPlans.filter((p: any) => 
      p.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [mealPlans, search]);

  const filteredStudents = useMemo(() => {
    return students.filter((s: Student) => 
      s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      s.grade?.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  const handleAddMealPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data: Omit<MealPlan, 'id'> = {
      title: formData.get('title') as string,
      status: 'Active',
      dateRange: formData.get('range') as string,
      schedule: [
        { day: 'Mon', meal: formData.get('mon') as string },
        { day: 'Tue', meal: formData.get('tue') as string },
        { day: 'Wed', meal: formData.get('wed') as string },
        { day: 'Thu', meal: formData.get('thu') as string || 'Standard Lunch' },
        { day: 'Fri', meal: formData.get('fri') as string || 'Standard Lunch' },
      ],
    };

    try {
      await operationsService.addMealPlan(database, data);
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
    try {
      await operationsService.deleteMealPlan(database, id);
      toast({ title: "Deleted", description: "Meal plan removed from system." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete plan." });
    }
  };

  const toggleSubscription = async (student: Student) => {
    try {
      await studentService.updateCateringStatus(database, student.id, !student.isCateringSubscribed);
      toast({ 
        title: student.isCateringSubscribed ? "Subscription Cancelled" : "Student Subscribed",
        description: `${student.studentName}'s catering status updated.`
      });
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const handleSaveDietary = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      await studentService.updateDietaryNotes(database, selectedStudent.id, dietaryNotes);
      setIsDietaryOpen(false);
      setSelectedStudent(null);
      toast({ title: "Notes Updated" });
    } catch (e) {
      toast({ title: "Failed to update notes", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CateringMetricCard label="Subscribers" value={studentsLoading ? '...' : stats.subscribers.toString()} trend="+12" icon={<Users className="h-4.5 w-4.5 text-blue-600" />} color="bg-blue-50" />
        <CateringMetricCard label="Today's Forecast" value={studentsLoading ? '...' : stats.todayCount.toString()} trend="Active" icon={<UtensilsCrossed className="h-4.5 w-4.5 text-green-600" />} color="bg-green-50" />
        <CateringMetricCard label="Est. Termly Revenue" value={`$${stats.revenue}`} trend="Billing" icon={<DollarSign className="h-4.5 w-4.5 text-purple-600" />} color="bg-purple-50" />
        <CateringMetricCard label="Dietary Alerts" value={studentsLoading ? '...' : stats.alerts.toString()} trend="Flags" icon={<CircleAlert className="h-4.5 w-4.5 text-amber-600" />} color="bg-amber-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Tabs defaultValue="meal-plans" className="w-full">
          <div className="flex items-center justify-between border-b border-gray-100 px-2 bg-white sticky top-0 z-10">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger value="meal-plans" className="px-6 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 rounded-none bg-transparent">Meal Plans</TabsTrigger>
              <TabsTrigger value="subscriptions" className="px-6 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 rounded-none bg-transparent">Subscription Registry</TabsTrigger>
            </TabsList>
            <div className="px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input placeholder="Search..." className="pl-8 h-8 text-[10px] w-48 border-gray-200" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="p-5">
            <TabsContent value="meal-plans" className="m-0 space-y-4">
              <div className="flex justify-end">
                {isAdmin && (
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
                            <Label className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Weekly Cycle</Label>
                            <div className="grid grid-cols-2 gap-3">
                              <Input name="mon" placeholder="Monday Meal" required />
                              <Input name="tue" placeholder="Tuesday Meal" required />
                              <Input name="wed" placeholder="Wednesday Meal" required />
                              <Input name="thu" placeholder="Thursday Meal" />
                              <Input name="fri" placeholder="Friday Meal" />
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
                )}
              </div>

              {plansLoading ? (
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
                          <div>
                            <p className="text-xs font-bold text-gray-800 truncate pr-4">{plan.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-tight">
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
                            <p className="text-[11px] text-gray-700 truncate font-medium">{item.meal}</p>
                          </div>
                        ))}
                      </div>
                      {isAdmin && (
                        <div className="px-3 py-2 bg-gray-50 flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleDelete(plan.id)} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-rose-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <UtensilsCrossed className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No meal plans configured.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="subscriptions" className="m-0">
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase tracking-tighter">
                    <tr>
                      <th className="px-4 py-4">Pupil</th>
                      <th className="px-4 py-4">Grade</th>
                      <th className="px-4 py-4">Subscription</th>
                      <th className="px-4 py-4">Dietary Notes</th>
                      <th className="px-4 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {studentsLoading ? (
                      <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" /></td></tr>
                    ) : filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50/50 group transition-colors">
                        <td className="px-4 py-4 font-bold text-gray-800">{student.studentName}</td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-bold uppercase text-gray-600">{student.grade}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {student.isCateringSubscribed ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="h-3 w-3" /> Subscribed
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                                <XCircle className="h-3 w-3" /> Unsubscribed
                              </span>
                            )}
                            {isAdmin && (
                              <Checkbox 
                                checked={student.isCateringSubscribed} 
                                onCheckedChange={() => toggleSubscription(student)}
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {student.dietaryRequirements ? (
                            <div className="flex items-center gap-1.5 text-rose-600 font-bold">
                              <CircleAlert className="h-3 w-3" />
                              <p className="truncate max-w-[150px]">{student.dietaryRequirements}</p>
                            </div>
                          ) : (
                            <span className="text-gray-300 italic text-[10px]">None recorded</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedStudent(student);
                              setDietaryNotes(student.dietaryRequirements || '');
                              setIsDietaryOpen(true);
                            }}
                            className="h-8 text-[10px] font-bold gap-1 text-orange-600 hover:bg-orange-50"
                          >
                            <FileText className="h-3 w-3" /> Edit Notes
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Dietary Notes Dialog */}
      <Dialog open={isDietaryOpen} onOpenChange={setIsDietaryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Dietary Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <p className="text-[10px] font-bold text-orange-700 uppercase mb-1">Student</p>
              <p className="text-xs font-bold text-gray-800">{selectedStudent?.studentName}</p>
            </div>
            <div className="space-y-2">
              <Label>Dietary Requirements & Allergies</Label>
              <Input 
                value={dietaryNotes} 
                onChange={(e) => setDietaryNotes(e.target.value)} 
                placeholder="e.g. Nut Allergy, No Shellfish, Vegetarian"
              />
              <p className="text-[10px] text-gray-400 italic">These notes will be highlighted to the kitchen staff.</p>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting} onClick={handleSaveDietary} className="w-full bg-orange-600">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Wellness Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
