
"use client"

import { useState } from 'react';
import { 
  Download, 
  Plus, 
  Stethoscope, 
  Syringe, 
  TriangleAlert, 
  ShieldAlert, 
  Search, 
  Phone, 
  ChevronDown,
  Clock,
  CircleCheck,
  User
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

const CLINIC_VISITS = [
  {
    id: '1',
    studentName: 'Tendai Moyo',
    admissionNo: 'SA-2024-001',
    grade: 'Grade 2A',
    condition: 'Headache and mild fever',
    date: '2026-02-24',
    time: '09:15',
    nurse: 'Nurse Manyika',
    outcome: 'Treated & Returned',
    statusColor: 'bg-green-100 text-green-700',
    parentNotified: false
  },
  {
    id: '2',
    studentName: 'Chipo Banda',
    admissionNo: 'SA-2024-002',
    grade: 'Grade 1B',
    condition: 'Stomach ache after break',
    date: '2026-02-24',
    time: '10:30',
    nurse: 'Nurse Manyika',
    outcome: 'Under Observation',
    statusColor: 'bg-purple-100 text-purple-700',
    parentNotified: true
  },
  {
    id: '3',
    studentName: 'Farai Dube',
    admissionNo: 'SA-2024-005',
    grade: 'Grade 5B',
    condition: 'Fell during PE, knee injury',
    date: '2026-02-24',
    time: '11:45',
    nurse: 'Nurse Manyika',
    outcome: 'Treated & Returned',
    statusColor: 'bg-green-100 text-green-700',
    parentNotified: false
  },
  {
    id: '4',
    studentName: 'Nyasha Chirwa',
    admissionNo: 'SA-2024-006',
    grade: 'Reception A',
    condition: 'Rash on arms',
    date: '2026-02-24',
    time: '08:50',
    nurse: 'Nurse Manyika',
    outcome: 'Sent Home',
    statusColor: 'bg-amber-100 text-amber-700',
    parentNotified: true
  },
  {
    id: '5',
    studentName: 'Blessing Mutasa',
    admissionNo: 'SA-2024-007',
    grade: 'Baby Class',
    condition: 'Crying, pulling at ear',
    date: '2026-02-23',
    time: '14:00',
    nurse: 'Nurse Manyika',
    outcome: 'Referred',
    statusColor: 'bg-blue-100 text-blue-700',
    parentNotified: true
  }
];

export default function HealthSafetyPage() {
  const [activeTab, setActiveTab] = useState('visits');

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Health & Safety Management</h2>
          <p className="text-xs text-gray-500">Clinic visits, immunisations, allergy alerts, and incident reporting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1.5 h-9 text-xs font-medium text-gray-600 bg-white border-gray-200 hover:bg-gray-50">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button className="flex items-center gap-1.5 h-9 px-4 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm">
            <Plus className="h-3.5 w-3.5" /> Log Visit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthMetricCard 
          icon={<Stethoscope className="h-4.5 w-4.5" />} 
          label="Today's Clinic Visits" 
          value="4" 
          color="bg-emerald-50 text-emerald-600" 
        />
        <HealthMetricCard 
          icon={<Syringe className="h-4.5 w-4.5" />} 
          label="Overdue Vaccines" 
          value="1" 
          color="bg-red-50 text-red-600" 
        />
        <HealthMetricCard 
          icon={<TriangleAlert className="h-4.5 w-4.5" />} 
          label="Severe Allergies" 
          value="2" 
          color="bg-amber-50 text-amber-600" 
        />
        <HealthMetricCard 
          icon={<ShieldAlert className="h-4.5 w-4.5" />} 
          label="Week Incidents" 
          value="5" 
          color="bg-blue-50 text-blue-600" 
        />
      </div>

      {/* Critical Alert Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
          <TriangleAlert className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-red-800">Life-Threatening Allergy Alerts</p>
          <div className="mt-1 space-y-1">
            <p className="text-[11px] text-red-700">
              <span className="font-semibold underline">Makanaka Chigumba</span> (Grade 4B) — <span className="font-bold">Penicillin</span>: Anaphylaxis risk, severe rash, breathing difficulty.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Tabs defaultValue="visits" className="w-full">
          <div className="flex border-b border-gray-100 px-2 overflow-x-auto custom-scrollbar">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger 
                value="visits" 
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none shadow-none bg-transparent"
              >
                <Stethoscope className="w-3.5 h-3.5" /> Clinic Visits
              </TabsTrigger>
              <TabsTrigger 
                value="immunisations" 
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none shadow-none bg-transparent"
              >
                <Syringe className="w-3.5 h-3.5" /> Immunisations
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[9px] font-bold">1</span>
              </TabsTrigger>
              <TabsTrigger 
                value="allergies" 
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none shadow-none bg-transparent"
              >
                <TriangleAlert className="w-3.5 h-3.5" /> Allergy Register
              </TabsTrigger>
              <TabsTrigger 
                value="incidents" 
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none shadow-none bg-transparent"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Incident Reports
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-5">
            <TabsContent value="visits" className="m-0 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input 
                    placeholder="Search visits by name, id, or condition..." 
                    className="pl-9 text-xs h-9 border-gray-200 focus:ring-1 focus:ring-emerald-500 outline-none" 
                  />
                </div>
                <Select defaultValue="All">
                  <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs bg-white border-gray-200">
                    <SelectValue placeholder="All Outcomes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Outcomes</SelectItem>
                    <SelectItem value="Treated">Treated & Returned</SelectItem>
                    <SelectItem value="Home">Sent Home</SelectItem>
                    <SelectItem value="Referred">Referred</SelectItem>
                    <SelectItem value="Observation">Under Observation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {CLINIC_VISITS.map((visit) => (
                  <div key={visit.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-bold text-gray-800">{visit.studentName}</p>
                        <span className="text-[10px] text-gray-400 font-medium px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">
                          {visit.admissionNo} | {visit.grade}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 font-medium">{visit.condition}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {visit.date} at {visit.time}</span>
                        <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" /> {visit.nurse}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm ${visit.statusColor}`}>
                        {visit.outcome}
                      </span>
                      {visit.parentNotified && (
                        <span className="text-[9px] text-blue-500 font-bold flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          <Phone className="h-2 w-2" /> Parent notified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="immunisations" className="p-8 text-center text-muted-foreground italic text-sm">
              Immunisation tracking and vaccine history module loading...
            </TabsContent>
            <TabsContent value="allergies" className="p-8 text-center text-muted-foreground italic text-sm">
              Comprehensive student allergy register and emergency protocols...
            </TabsContent>
            <TabsContent value="incidents" className="p-8 text-center text-muted-foreground italic text-sm">
              Health-related incident reporting and safety logs...
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
