
"use client"

import { useState, useMemo } from 'react';
import { 
  Plus, 
  Stethoscope, 
  Syringe, 
  TriangleAlert, 
  ShieldAlert, 
  Search, 
  Phone, 
  Clock,
  User,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDatabase, useRTDBCollection } from '@/firebase';

export default function HealthSafetyPage() {
  const [activeTab, setActiveTab] = useState('visits');
  const database = useDatabase();
  const { data: visits, loading } = useRTDBCollection(database, 'health_records');

  const stats = useMemo(() => {
    return {
      today: visits.filter((v: any) => v.date === new Date().toISOString().split('T')[0]).length,
      allergies: 2, // Mock or fetch from student metadata
      incidents: visits.length,
    };
  }, [visits]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Health & Safety Management</h2>
          <p className="text-xs text-gray-500">Institutional health records and incident monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button className="flex items-center gap-1.5 h-9 px-4 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm">
            <Plus className="h-3.5 w-3.5" /> Log Visit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthMetricCard icon={<Stethoscope className="h-4.5 w-4.5" />} label="Today's Clinic Visits" value={loading ? '...' : stats.today.toString()} color="bg-emerald-50 text-emerald-600" />
        <HealthMetricCard icon={<Syringe className="h-4.5 w-4.5" />} label="Overdue Vaccines" value="1" color="bg-red-50 text-red-600" />
        <HealthMetricCard icon={<TriangleAlert className="h-4.5 w-4.5" />} label="Severe Allergies" value={stats.allergies.toString()} color="bg-amber-50 text-amber-600" />
        <HealthMetricCard icon={<ShieldAlert className="h-4.5 w-4.5" />} label="Record Count" value={loading ? '...' : stats.incidents.toString()} color="bg-blue-50 text-blue-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Tabs defaultValue="visits" className="w-full">
          <div className="flex border-b border-gray-100 px-2 overflow-x-auto">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger value="visits" className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none shadow-none bg-transparent">
                <Stethoscope className="w-3.5 h-3.5" /> Clinic Visits
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-5">
            <TabsContent value="visits" className="m-0 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
                  <p className="text-xs text-gray-400 italic">Syncing clinical logs...</p>
                </div>
              ) : visits.length > 0 ? (
                <div className="space-y-2">
                  {visits.map((visit: any) => (
                    <div key={visit.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs font-bold text-gray-800">{visit.studentName}</p>
                          <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">
                            {visit.grade}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 font-medium">{visit.condition}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-3">
                          <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {visit.date}</span>
                          <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" /> {visit.nurse || 'Nurse Manyika'}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm bg-green-100 text-green-700">
                          {visit.outcome || 'Treated'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 italic text-xs">
                  No clinic visits recorded.
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function HealthMetricCard({ icon, label, value, color }: any) {
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
