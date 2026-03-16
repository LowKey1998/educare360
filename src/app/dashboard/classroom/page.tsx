
"use client"

import { useState, useMemo } from 'react';
import { 
  BookOpen, 
  LayoutGrid, 
  Users, 
  FileText, 
  ClipboardList, 
  Search, 
  MapPin, 
  Loader2,
  Trash2,
  Plus,
  Database
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
import { useToast } from '@/hooks/use-toast';

export default function ClassroomManagementPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: classrooms, loading } = useRTDBCollection(database, 'classrooms');

  const filteredClassrooms = useMemo(() => {
    return classrooms.filter((c: any) => 
      c.name?.toLowerCase().includes(search.toLowerCase()) || 
      c.teacher?.toLowerCase().includes(search.toLowerCase())
    );
  }, [classrooms, search]);

  const handleAddClassroom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      teacher: formData.get('teacher'),
      location: formData.get('location'),
      capacity: parseInt(formData.get('capacity') as string) || 35,
      status: 'Active',
      createdAt: serverTimestamp()
    };

    try {
      await push(ref(database, 'classrooms'), data);
      setIsAddOpen(false);
      toast({ title: "Classroom Added", description: `${data.name} is now ready.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to create classroom.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this learning space?')) return;
    try {
      await remove(ref(database, `classrooms/${id}`));
      toast({ title: "Removed", description: "Classroom deleted." });
    } catch (e) {
      toast({ title: "Error", description: "Delete failed." });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* High-Fidelity Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="30" r="80" fill="white" />
            <circle cx="50" cy="180" r="100" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Classroom Management</h2>
            <p className="text-sm text-white/80 mt-1">Manage institutional learning spaces and teacher assignments</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3.5 h-3.5" /> Rooms Live
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Classrooms" value={loading ? '...' : classrooms.length.toString()} icon={<LayoutGrid className="w-4 h-4 text-blue-600" />} color="bg-blue-50" />
        <StatCard label="Teachers Assigned" value={loading ? '...' : classrooms.length.toString()} icon={<Users className="w-4 h-4 text-purple-600" />} color="bg-purple-50" />
        <StatCard label="Lesson Plans" value="14" icon={<FileText className="w-4 h-4 text-amber-600" />} color="bg-amber-50" />
        <StatCard label="Live Sessions" value="8" icon={<ClipboardList className="w-4 h-4 text-red-600" />} color="bg-red-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search classrooms or teachers..." 
                  className="pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg w-full focus:ring-1 focus:ring-amber-500 outline-none" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 h-9 text-xs font-bold gap-1.5 shadow-sm">
                    <Plus className="h-3.5 w-3.5" /> Add Classroom
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddClassroom}>
                    <DialogHeader>
                      <DialogTitle>Register Learning Space</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Room Name/Code</Label>
                        <Input name="name" placeholder="e.g. Grade 2A, Science Lab 1" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Assigned Teacher</Label>
                        <Input name="teacher" placeholder="Mr. John Nyathi" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input name="location" placeholder="e.g. Main Block" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Capacity</Label>
                          <Input name="capacity" type="number" placeholder="35" required />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting} className="w-full bg-teal-600">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Confirm Room
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-amber-600 mb-2" />
                <p className="text-xs text-gray-400 italic">Syncing learning spaces...</p>
              </div>
            ) : filteredClassrooms.length > 0 ? (
              <div className="overflow-x-auto border border-gray-50 rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Classroom</th>
                      <th className="text-left py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Teacher</th>
                      <th className="text-left py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Location</th>
                      <th className="text-center py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Capacity</th>
                      <th className="text-left py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Status</th>
                      <th className="text-right py-3.5 px-4 font-bold text-gray-500 uppercase tracking-tighter">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredClassrooms.map((room: any) => (
                      <tr key={room.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-800">{room.name}</div>
                          <div className="text-[9px] text-gray-400 font-mono">{room.id}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-medium">{room.teacher}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MapPin className="w-3 h-3 text-amber-500" /> {room.location}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-gray-800">{room.capacity}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700">Active</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => handleDelete(room.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">No classrooms configured.</p>
                <p className="text-xs text-gray-300 mt-1">Start by defining learning spaces for your institution.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${color} text-gray-700`}>{label}</span>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
