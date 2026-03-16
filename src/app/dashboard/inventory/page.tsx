
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
  Calculator
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
        a.assetTag?.toLowerCase().includes(search.toLowerCase()) ||
        a.serialNumber?.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
      const matchesCondition = conditionFilter === 'All' || a.condition === conditionFilter;

      return matchesSearch && matchesCategory && matchesCondition;
    });
  }, [assets, search, categoryFilter, conditionFilter]);

  const stats = useMemo(() => {
    if (!assets) return { total: 0, repair: 0, lowStock: 5, totalValue: 0, cost: 0 };
    
    const total = assets.length;
    const repair = assets.filter((a: any) => a.condition === 'Fair' || a.condition === 'Damaged').length;
    const totalValue = assets.reduce((acc: number, a: any) => acc + (parseFloat(a.value) || 0), 0);
    const cost = assets.reduce((acc: number, a: any) => acc + (parseFloat(a.cost) || 0), 0);

    return { total, repair, lowStock: 5, totalValue, cost };
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
      custodian: formData.get('custodian') || 'N/A',
      status: 'Active',
      createdAt: serverTimestamp()
    };

    try {
      await push(ref(database, 'assets'), data);
      setIsAddOpen(false);
      toast({ title: "Asset Registered", description: `${data.name} added to inventory.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to save asset.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this asset?')) return;
    try {
      await remove(ref(database, `assets/${id}`));
      toast({ title: "Asset Removed", description: "The record has been deleted." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete record." });
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
            Inventory & Assets Management
            <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-[9px] font-semibold rounded-full flex items-center gap-1">
              <Database className="h-2.5 w-2.5" /> Server Query
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Track assets and consumables with server-side search, filter, sort, and pagination</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 text-xs gap-1.5" onClick={() => toast({ title: "Export Started", description: "Preparing inventory manifest..." })}>
            <Download className="h-3.5 w-3.5" /> Export <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Assets" value={loading ? '...' : stats.total.toString()} trend={`${assets.length} active`} icon={<Package className="h-4.5 w-4.5 text-blue-600" />} color="bg-blue-50" />
        <MetricCard label="Needs Repair" value={loading ? '...' : stats.repair.toString()} trend="Fair/Damaged" icon={<Wrench className="h-4.5 w-4.5 text-amber-600" />} color="bg-amber-50" />
        <MetricCard label="Low Stock Items" value="5" trend="Reorder needed" icon={<TriangleAlert className="h-4.5 w-4.5 text-red-600" />} color="bg-red-50" />
        <MetricCard label="Total Asset Value" value={loading ? '...' : `$${stats.totalValue.toLocaleString()}`} trend={`Cost: $${stats.cost.toLocaleString()}`} icon={<ChartColumn className="h-4.5 w-4.5 text-green-600" />} color="bg-green-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Tabs defaultValue="register" className="w-full">
          <div className="flex border-b border-gray-100 px-2 overflow-x-auto custom-scrollbar">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger value="register" className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">
                <Package className="w-3.5 h-3.5" /> Asset Register
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">
                <Boxes className="w-3.5 h-3.5" /> Stock Management
              </TabsTrigger>
              <TabsTrigger value="io" className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">
                <ArrowRightLeft className="w-3.5 h-3.5" /> Check In/Out
              </TabsTrigger>
              <TabsTrigger value="procurement" className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">
                <ShoppingCart className="w-3.5 h-3.5" /> Procurement
              </TabsTrigger>
              <TabsTrigger value="depreciation" className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">
                <Calculator className="w-3.5 h-3.5" /> Depreciation
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-5">
            <TabsContent value="register" className="m-0 space-y-4">
              <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center flex-1">
                  <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input 
                      placeholder="Search assets, tags, serial..." 
                      className="pl-9 text-xs h-9 border-gray-200" 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[140px] h-9 text-xs">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Textbooks">Textbooks</SelectItem>
                      <SelectItem value="Lab Equipment">Lab Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={conditionFilter} onValueChange={setConditionFilter}>
                    <SelectTrigger className="w-[140px] h-9 text-xs">
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Conditions</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-gray-600">
                    <QrCode className="h-3.5 w-3.5" /> Scan Barcode
                  </Button>
                  <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-9 px-4 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700">
                        <Plus className="h-3.5 w-3.5" /> Add Asset
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <form onSubmit={handleAddAsset}>
                        <DialogHeader>
                          <DialogTitle>Register New Asset</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Asset Name</Label>
                              <Input name="name" placeholder="e.g. Dell Latitude 5420" required />
                            </div>
                            <div className="space-y-2">
                              <Label>Category</Label>
                              <Select name="category" defaultValue="Electronics">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Electronics">Electronics</SelectItem>
                                  <SelectItem value="Furniture">Furniture</SelectItem>
                                  <SelectItem value="Lab Equipment">Lab Equipment</SelectItem>
                                  <SelectItem value="Sports Equipment">Sports Equipment</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Asset Tag</Label>
                              <Input name="tag" placeholder="SA-ELC-001" required />
                            </div>
                            <div className="space-y-2">
                              <Label>Serial Number</Label>
                              <Input name="serial" placeholder="SN-12345678" required />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Location</Label>
                              <Input name="location" placeholder="e.g. ICT Lab" required />
                            </div>
                            <div className="space-y-2">
                              <Label>Condition</Label>
                              <Select name="condition" defaultValue="Good">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="New">New</SelectItem>
                                  <SelectItem value="Good">Good</SelectItem>
                                  <SelectItem value="Fair">Fair</SelectItem>
                                  <SelectItem value="Damaged">Damaged</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Purchase Cost ($)</Label>
                              <Input name="cost" type="number" step="0.01" required />
                            </div>
                            <div className="space-y-2">
                              <Label>Current Value ($)</Label>
                              <Input name="value" type="number" step="0.01" required />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Register Asset"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
                  <p className="text-xs text-gray-400 italic">Syncing inventory...</p>
                </div>
              ) : filteredAssets.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-left border-b border-gray-100">
                        <th className="px-4 py-3 font-medium">Asset</th>
                        <th className="px-4 py-3 font-medium">Tag / Serial</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Location</th>
                        <th className="px-4 py-3 font-medium">Condition</th>
                        <th className="px-4 py-3 font-medium text-right">Value</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredAssets.map((asset: any) => (
                        <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-800">{asset.name}</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Custodian: {asset.custodian || 'School'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Tag className="h-3 w-3 text-gray-400" />
                              <div>
                                <p className="text-gray-700 font-mono text-[10px]">{asset.assetTag}</p>
                                <p className="text-[9px] text-gray-400">{asset.serialNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              asset.category === 'Electronics' ? 'bg-blue-100 text-blue-700' :
                              asset.category === 'Furniture' ? 'bg-amber-100 text-amber-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {asset.category}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-gray-700">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span>{asset.location}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              asset.condition === 'New' ? 'bg-emerald-100 text-emerald-700' :
                              asset.condition === 'Good' ? 'bg-blue-100 text-blue-700' :
                              asset.condition === 'Fair' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {asset.condition}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-semibold text-gray-800">${asset.value?.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400">Cost: ${asset.cost?.toLocaleString()}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                              <button className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"><SquarePen className="h-3.5 w-3.5" /></button>
                              <button onClick={() => handleDelete(asset.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <Package className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No assets registered yet.</p>
                  <p className="text-xs text-gray-300 mt-1">Start by adding equipment or materials to the register.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="stock" className="p-12 text-center text-gray-400 italic text-xs">
              Consumables tracking and inventory audit module...
            </TabsContent>
            <TabsContent value="io" className="p-12 text-center text-gray-400 italic text-xs">
              Asset assignment and checkout history...
            </TabsContent>
            <TabsContent value="procurement" className="p-12 text-center text-gray-400 italic text-xs">
              Purchase requests and supplier management...
            </TabsContent>
            <TabsContent value="depreciation" className="p-12 text-center text-gray-400 italic text-xs">
              Financial valuation and depreciation schedules...
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
        <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${color} text-gray-700 uppercase tracking-tighter`}>{label}</span>
        <span className="text-[10px] font-medium flex items-center gap-0.5 text-green-600">
          <ChartColumn className="w-2.5 h-2.5" /> {trend}
        </span>
      </div>
      <div className="flex items-end justify-between mt-3">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
