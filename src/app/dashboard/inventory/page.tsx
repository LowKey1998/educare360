
"use client"

import { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Database, 
  Trash2,
  Loader2,
  Wrench,
  TriangleAlert,
  ChartColumn
} from 'lucide-react';
import { useDatabase, useRTDBCollection, useRTDBDoc } from '@/firebase';
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
import { operationsService } from '@/services/operations';
import { Asset } from '@/lib/types';

export default function InventoryManagementPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: assets, loading } = useRTDBCollection<Asset>(database, 'assets');
  const { data: schoolSettings } = useRTDBDoc(database, 'system_settings');

  const currencySymbol = schoolSettings?.currencySymbol || '$';

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
    if (!assets || assets.length === 0) return { total: 0, repair: 0, lowStock: 5, totalValue: 0, cost: 0, valueTrend: '0.0' };
    
    const total = assets.length;
    const repair = assets.filter((a: any) => a.condition === 'Fair' || a.condition === 'Damaged').length;
    const totalValue = assets.reduce((acc: number, a: any) => acc + (parseFloat(a.value as any) || 0), 0);
    const totalCost = assets.reduce((acc: number, a: any) => acc + (parseFloat(a.cost as any) || 0), 0);
    
    const valueTrend = totalCost > 0 ? ((totalValue / totalCost) * 100).toFixed(1) : '0.0';

    return { total, repair, lowStock: 5, totalValue, totalCost, valueTrend };
  }, [assets]);

  const handleAddAsset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      assetTag: formData.get('tag') as string,
      serialNumber: formData.get('serial') as string,
      category: formData.get('category') as string,
      location: formData.get('location') as string,
      condition: formData.get('condition') as string,
      value: parseFloat(formData.get('value') as string) || 0,
      cost: parseFloat(formData.get('cost') as string) || 0,
      status: 'Active',
    };

    try {
      await operationsService.addAsset(database, data);
      setIsAddOpen(false);
      toast({ title: "Asset Registered", description: `${data.name} added.` });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this asset?')) return;
    try {
      await operationsService.deleteAsset(database, id);
      toast({ title: "Asset Removed" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
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
        <MetricCard label="Asset Valuation" value={loading ? '...' : `${currencySymbol}${stats.totalValue.toLocaleString()}`} trend={`${stats.valueTrend}% of cost`} icon={<ChartColumn className="h-4.5 w-4.5 text-green-600" />} color="bg-green-50" />
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
                      <SelectItem value="Lab Equipment">Lab Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-9 px-4 text-xs bg-teal-600 hover:bg-teal-700 font-bold"><Plus className="h-3.5 w-3.5" /> Add Asset</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <form onSubmit={handleAddAsset}>
                      <DialogHeader><DialogTitle>Register New Asset</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Asset Name</Label>
                            <Input name="name" placeholder="e.g. Science Lab Microscope" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select name="category" defaultValue="Electronics">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Electronics">Electronics</SelectItem>
                                <SelectItem value="Furniture">Furniture</SelectItem>
                                <SelectItem value="Lab Equipment">Lab Equipment</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Asset Tag</Label>
                            <Input name="tag" placeholder="INV-2026-001" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Serial No</Label>
                            <Input name="serial" placeholder="SN-12345" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Purchase Cost ({currencySymbol})</Label>
                            <Input name="cost" type="number" step="0.01" placeholder="0.00" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Current Value ({currencySymbol})</Label>
                            <Input name="value" type="number" step="0.01" placeholder="0.00" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Location</Label>
                            <Input name="location" placeholder="Main Lab" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Condition</Label>
                            <Select name="condition" defaultValue="Excellent">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Excellent">Excellent</SelectItem>
                                <SelectItem value="Good">Good</SelectItem>
                                <SelectItem value="Fair">Fair (Needs Repair)</SelectItem>
                                <SelectItem value="Damaged">Damaged</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full bg-teal-600">Finalize Registry</Button></DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
              ) : filteredAssets.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase tracking-tighter">
                      <tr>
                        <th className="px-4 py-3">Asset Identity</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Value</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredAssets.map((asset: any) => (
                        <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-4 py-3">
                            <p className="font-bold text-gray-800">{asset.name}</p>
                            <p className="text-[9px] text-gray-400 font-mono mt-0.5">{asset.assetTag}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-600 uppercase">{asset.category}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-700">{currencySymbol}{parseFloat(asset.value as any).toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              asset.condition === 'Fair' || asset.condition === 'Damaged' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>{asset.condition}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleDelete(asset.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 border-dashed border-2 rounded-2xl">
                  <Package className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-medium">No assets matching your search criteria.</p>
                </div>
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
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">{trend}</span>
      </div>
      <div className="flex items-end justify-between mt-3">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${color}`}>{icon}</div>
      </div>
    </div>
  );
}
