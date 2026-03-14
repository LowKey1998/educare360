
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
  Plus
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
    await remove(ref(database, `classrooms/${id}`));
    toast({ title: "Removed", description: "Classroom deleted." });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            Classroom Management
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage institutional learning spaces and teacher assignments</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Add Classroom
            </button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddClassroom}>
              <DialogHeader>
                <DialogTitle>Add New Learning Space</DialogTitle>
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Classroom"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Classrooms" value={loading ? '...' : classrooms.length.toString()} icon={<LayoutGrid className="w-[18px] h-[18px] text-blue-600" />} color="bg-blue-50" />
        <StatCard label="Teachers Assigned" value={loading ? '...' : classrooms.length.toString()} icon={<Users className="w-[18px] h-[18px] text-purple-600" />} color="bg-purple-50" />
        <StatCard label="Lesson Plans" value="6" icon={<FileText className="w-[18px] h-[18px] text-amber-600" />} color="bg-amber-50" />
        <StatCard label="Assignments" value="4" icon={<ClipboardList className="w-[18px] h-[18px] text-red-600" />} color="bg-red-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-5">
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search classrooms..." 
                className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg w-full focus:ring-1 focus:ring-teal-500 outline-none" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
                <p className="text-xs text-gray-400 italic">Syncing rooms...</p>
              </div>
            ) : filteredClassrooms.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Classroom</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Teacher</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Location</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-600">Capacity</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Status</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredClassrooms.map((room: any) => (
                      <tr key={room.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-3 px-3">
                          <div className="font-medium text-gray-800">{room.name}</div>
                          <div className="text-gray-400 text-[10px]">{room.id}</div>
                        </td>
                        <td className="py-3 px-3 text-gray-700">{room.teacher}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-3 h-3 text-gray-400" /> {room.location}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-gray-700">{room.capacity}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">Active</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button onClick={() => handleDelete(room.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 italic text-xs">No records found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${color}`}>{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      </div>
    </div>
  );
}
