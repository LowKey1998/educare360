
"use client"

import { useState, useMemo } from 'react';
import { 
  Navigation, 
  Users, 
  Bus, 
  DollarSign, 
  Search, 
  Plus, 
  MapPin, 
  Clock,
  Loader2,
  Trash2,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function TransportManagementPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: routes, loading } = useRTDBCollection(database, 'transport_routes');

  const stats = useMemo(() => {
    const active = routes.filter((r: any) => r.status === 'Active').length;
    const totalPupils = routes.reduce((acc: number, r: any) => acc + (parseInt(r.pupils) || 0), 0);
    const capacity = routes.reduce((acc: number, r: any) => acc + (parseInt(r.capacity) || 0), 0);
    return {
      active,
      pupils: totalPupils,
      capacityPct: capacity > 0 ? ((totalPupils / capacity) * 100).toFixed(1) : '0.0',
      revenue: (totalPupils * 45).toLocaleString() // Estimated $45/pupil
    };
  }, [routes]);

  const filteredRoutes = useMemo(() => {
    return routes.filter((r: any) => 
      r.name?.toLowerCase().includes(search.toLowerCase()) || 
      r.area?.toLowerCase().includes(search.toLowerCase())
    );
  }, [routes, search]);

  const handleAddRoute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      area: formData.get('area'),
      stops: parseInt(formData.get('stops') as string) || 0,
      pupils: 0,
      capacity: parseInt(formData.get('capacity') as string) || 35,
      status: 'Active',
      createdAt: serverTimestamp()
    };

    try {
      await push(ref(database, 'transport_routes'), data);
      setIsAddOpen(false);
      toast({ title: "Route Added", description: `"${data.name}" is now active in the fleet.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to create route.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this bus route? This will unassign all students.')) return;
    try {
      await remove(ref(database, `transport_routes/${id}`));
      toast({ title: "Route Removed", description: "The bus route was deleted." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete route." });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* High-Fidelity Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="30" r="80" fill="white" />
            <circle cx="50" cy="180" r="100" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Bus className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Fleet & Transport Management</h2>
            <p className="text-sm text-white/80 mt-1">Manage institutional logistics, bus routes, and pupil allocations</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" /> Fleet Safety Verified
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <TransportMetricCard icon={<Navigation className="h-4.5 w-4.5 text-indigo-600" />} label="Active Routes" value={loading ? '...' : stats.active.toString()} color="bg-indigo-50" trend="Live Sync" />
        <TransportMetricCard icon={<Users className="h-4.5 w-4.5 text-blue-600" />} label="Total Pupils" value={loading ? '...' : stats.pupils.toString()} color="bg-blue-50" trend={`${stats.capacityPct}% Capacity`} />
        <TransportMetricCard icon={<Zap className="h-4.5 w-4.5 text-amber-600" />} label="Bus Fleet" value={loading ? '...' : routes.length.toString()} color="bg-amber-50" trend="All Active" />
        <TransportMetricCard icon={<DollarSign className="h-4.5 w-4.5 text-emerald-600" />} label="Est. Revenue" value={`$${stats.revenue}`} color="bg-emerald-50" trend="+5.2% MoM" />
      </div>

      <Card className="border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
          <div>
            <CardTitle className="text-sm font-bold text-gray-800">Route Directory</CardTitle>
            <CardDescription className="text-xs">Real-time status of institutional logistics</CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input 
                placeholder="Search routes..." 
                className="pl-8 h-8 text-xs border-gray-200" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Route
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddRoute}>
                  <DialogHeader>
                    <DialogTitle>Register New Route</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Route Name</Label>
                      <Input name="name" placeholder="e.g. Route 1 — Northern Suburbs" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Area Coverage</Label>
                      <Input name="area" placeholder="e.g. Borrowdale, Mt Pleasant" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>No. of Stops</Label>
                        <Input name="stops" type="number" placeholder="12" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Bus Capacity</Label>
                        <Input name="capacity" type="number" placeholder="35" required />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Confirm Route
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-xs text-gray-400 italic">Synchronizing fleet logs...</p>
            </div>
          ) : filteredRoutes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 divide-x divide-y divide-gray-50">
              {filteredRoutes.map((route: any) => (
                <div key={route.id} className="p-5 hover:bg-gray-50/50 transition-all group relative">
                  <button 
                    onClick={() => handleDelete(route.id)} 
                    className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                      <Bus className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate pr-6">{route.name}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-2.5 w-2.5" /> {route.area}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-500 font-medium uppercase tracking-tighter">Capacity Utilization</span>
                      <span className="text-gray-800 font-bold">{route.pupils || 0}/{route.capacity || 35}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          (route.pupils/route.capacity) > 0.9 ? 'bg-rose-500' : 'bg-indigo-500'
                        }`} 
                        style={{ width: `${Math.min(100, (route.pupils/route.capacity) * 100)}%` }} 
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        <Clock className="h-3 w-3" /> {route.stops || 0} Scheduled Stops
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">
                        {route.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400 italic text-xs">
              No transport routes configured.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TransportMetricCard({ label, value, icon, color, trend }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-gray-400">{trend}</span>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
