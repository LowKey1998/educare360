
"use client"

import { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Download, 
  ChevronDown, 
  Database, 
  MapPin, 
  Tag, 
  Eye, 
  SquarePen, 
  Trash2,
  Loader2,
  Wrench,
  TriangleAlert,
  ChartColumn,
  QrCode,
  Boxes,
  ArrowRightLeft,
  ShoppingCart,
  Calculator,
  TrendingUp
} from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function InventoryManagementPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: assets, loading } = useRTDBCollection(database, 'assets');

  const filteredAssets = useMemo(() => {
    return assets.filter((a: any) => {
      const matchesSearch = 
        a.name?.toLowerCase().includes(search.toLowerCase()) || 
        a.assetTag?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
      const matchesCondition = conditionFilter === 'All' || a.condition === conditionFilter;
      return matchesSearch && matchesCategory && matchesCondition;
    });
  }, [assets, search, categoryFilter, conditionFilter]);

  const stats = useMemo(() => {
    if (!assets) return { total: 0, repair: 0, lowStock: 5, totalValue: 0, cost: 0, valueTrend: '0.0' };
    
    const total = assets.length;
    const repair = assets.filter((a: any) => a.condition === 'Fair' || a.condition === 'Damaged').length;
    const totalValue = assets.reduce((acc: number, a: any) => acc + (parseFloat(a.value) || 0), 0);
    const cost = assets.reduce((acc: number, a: any) => acc + (parseFloat(a.cost) || 0), 0);
    
    // Trend: Current Value vs Cost
    const valueTrend = cost > 0 ? ((totalValue / cost) * 100).toFixed(1) : '0.0';

    return { total, repair, lowStock: 5, totalValue, cost, valueTrend };
  }, [assets]);

  const handleAddAsset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      assetTag: formData.get('tag'),
      serialNumber: formData.get('serial'),
      category: formData.get('category'),
      location: formData.get('location'),
      condition: formData.get('condition'),
      value: parseFloat(formData.get('value') as string) || 0,
      cost: parseFloat(formData.get('cost') as string) || 0,
      status: 'Active',
      createdAt: serverTimestamp()
    };

    try {
      await push(ref(database, 'assets'), data);
      setIsAddOpen(false);
      toast({ title: "Asset Registered", description: `${data.name} added.` });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            Inventory & Assets
            <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-[9px] font-semibold rounded-full flex items-center gap-1">
              <Database className="h-2.5 w-2.5" /> Registry Live
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Track institutional property and equipment valuations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Assets" value={loading ? '...' : stats.total.toString()} trend="Registry" icon={<Package className="h-4.5 w-4.5 text-blue-600" />} color="bg-blue-50" />
        <MetricCard label="Needs Repair" value={loading ? '...' : stats.repair.toString()} trend="Attention" icon={<Wrench className="h-4.5 w-4.5 text-amber-600" />} color="bg-amber-50" />
        <MetricCard label="Low Stock" value="5" trend="Alerts" icon={<TriangleAlert className="h-4.5 w-4.5 text-red-600" />} color="bg-red-50" />
        <MetricCard label="Asset Valuation" value={loading ? '...' : `$${stats.totalValue.toLocaleString()}`} trend={`${stats.valueTrend}% of cost`} icon={<ChartColumn className="h-4.5 w-4.5 text-green-600" />} color="bg-green-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Tabs defaultValue="register" className="w-full">
          <div className="flex border-b border-gray-100 px-2 overflow-x-auto">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger value="register" className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none bg-transparent">Register</TabsTrigger>
              <TabsTrigger value="stock" className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none bg-transparent">Stock</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-5">
            <TabsContent value="register" className="m-0 space-y-4">
              <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center flex-1">
                  <Input placeholder="Search..." className="max-w-xs h-9 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-9 px-4 text-xs bg-teal-600 hover:bg-teal-700"><Plus className="h-3.5 w-3.5" /> Add Asset</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <form onSubmit={handleAddAsset}>
                      <DialogHeader><DialogTitle>Register New Asset</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Input name="name" placeholder="Asset Name" required />
                          <Select name="category" defaultValue="Electronics">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Electronics">Electronics</SelectItem>
                              <SelectItem value="Furniture">Furniture</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input name="tag" placeholder="Asset Tag" required />
                          <Input name="serial" placeholder="Serial No" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input name="cost" type="number" placeholder="Purchase Cost" required />
                          <Input name="value" type="number" placeholder="Current Value" required />
                        </div>
                      </div>
                      <DialogFooter><Button type="submit" disabled={isSubmitting}>Confirm</Button></DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
              ) : filteredAssets.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left">Asset</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-right">Value</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredAssets.map((asset: any) => (
                        <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium">{asset.name}</td>
                          <td className="px-4 py-3">{asset.category}</td>
                          <td className="px-4 py-3 text-right font-bold">${asset.value}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => remove(ref(database, `assets/${asset.id}`))} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 border-dashed border-2">No assets found.</div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase">{label}</span>
        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">{trend}</span>
      </div>
      <div className="flex items-end justify-between mt-3">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      </div>
    </div>
  );
}
