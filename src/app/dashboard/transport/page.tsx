
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
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

  const filteredRoutes = useMemo(() => {
    return routes.filter((r: any) => 
      r.name?.toLowerCase().includes(search.toLowerCase()) || 
      r.area?.toLowerCase().includes(search.toLowerCase())
    );
  }, [routes, search]);

  const stats = useMemo(() => {
    const active = routes.filter((r: any) => r.status === 'Active').length;
    const pupils = routes.reduce((acc: number, r: any) => acc + (parseInt(r.pupils as string) || 0), 0);
    return { active, pupils };
  }, [routes]);

  const handleAddRoute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      area: formData.get('area'),
      stops: parseInt(formData.get('stops') as string),
      pupils: 0,
      capacity: parseInt(formData.get('capacity') as string) || 35,
      status: 'Active',
      createdAt: serverTimestamp()
    };

    try {
      await push(ref(database, 'transport_routes'), data);
      setIsAddOpen(false);
      toast({ title: "Route Added", description: `"${data.name}" is now active.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to create route.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Cancel this transport route?')) return;
    await remove(ref(database, `transport_routes/${id}`));
    toast({ title: "Removed", description: "Route deleted." });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Transport Management</h2>
          <p className="text-xs text-gray-500">Manage bus routes and pupil allocations</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1.5 h-9 px-4 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm">
                <Plus className="h-3.5 w-3.5" /> Add Route
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddRoute}>
                <DialogHeader>
                  <DialogTitle>Define New Bus Route</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Route Name</Label>
                    <Input name="name" placeholder="e.g. Route 1 - Northern Suburbs" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Area Covered</Label>
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
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Confirm Route"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <TransportStatCard icon={<Navigation className="h-4 w-4" />} label="Active Routes" value={loading ? '...' : stats.active.toString()} color="bg-indigo-50 text-indigo-600" />
        <TransportStatCard icon={<Users className="h-4 w-4" />} label="Total Pupils" value={loading ? '...' : stats.pupils.toString()} color="bg-teal-50 text-teal-600" />
        <TransportStatCard icon={<Bus className="h-4 w-4" />} label="Fleet" value={loading ? '...' : routes.length.toString()} color="bg-amber-50 text-amber-600" />
        <TransportStatCard icon={<DollarSign className="h-4 w-4" />} label="Monthly Est" value="$9,250" color="bg-green-50 text-green-600" />
      </div>

      <Card className="border-gray-100 overflow-hidden shadow-sm">
        <div className="p-5">
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input 
                placeholder="Search routes..." 
                className="pl-9 text-xs h-9 border-gray-200" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
                <p className="text-xs text-gray-400 italic">Syncing transport...</p>
              </div>
            ) : filteredRoutes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredRoutes.map((route: any) => (
                  <div key={route.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all group relative">
                    <button onClick={() => handleDelete(route.id)} className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                          <Bus className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate pr-4">{route.name}</p>
                          <p className="text-[10px] text-gray-500">{route.area}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-green-100 text-green-700">
                        {route.status || 'Active'}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[10px] text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-gray-400" /> {route.stops || 0} stops
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-gray-400" /> {route.pupils || 0}/{route.capacity || 35} pupils
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 italic text-xs">No routes found.</div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function TransportStatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className={`w-8 h-8 rounded-lg ${color.split(' ')[0]} flex items-center justify-center mb-2 transition-transform group-hover:scale-110 shadow-sm`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}
