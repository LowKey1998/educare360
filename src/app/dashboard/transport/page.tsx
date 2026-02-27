"use client"

import { useState } from 'react';
import { 
  Navigation, 
  Users, 
  Bus, 
  DollarSign, 
  Search, 
  Download, 
  Plus, 
  MapPin, 
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROUTES = [
  {
    id: 'RT-001',
    name: 'Avondale Circuit',
    area: 'Avondale / Avonlea',
    stops: 5,
    distance: 12,
    depart: '06:30 AM',
    return: '14:30 PM',
    pupils: 28,
    capacity: 35,
    price: 45,
    status: 'Active',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'RT-002',
    name: 'Borrowdale Express',
    area: 'Borrowdale / Brooke',
    stops: 5,
    distance: 18,
    depart: '06:15 AM',
    return: '14:30 PM',
    pupils: 32,
    capacity: 35,
    price: 55,
    status: 'Active',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'RT-003',
    name: 'Greendale Link',
    area: 'Greendale / Highlands',
    stops: 5,
    distance: 15,
    depart: '06:20 AM',
    return: '14:30 PM',
    pupils: 22,
    capacity: 30,
    price: 50,
    status: 'Active',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'RT-004',
    name: 'Mount Pleasant Shuttle',
    area: 'Mt Pleasant / Marlborough',
    stops: 5,
    distance: 10,
    depart: '06:40 AM',
    return: '14:30 PM',
    pupils: 18,
    capacity: 25,
    price: 40,
    status: 'Active',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'RT-005',
    name: 'Waterfalls Route',
    area: 'Waterfalls / Glen Norah',
    stops: 5,
    distance: 22,
    depart: '06:00 AM',
    return: '14:30 PM',
    pupils: 30,
    capacity: 40,
    price: 60,
    status: 'Active',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'RT-006',
    name: 'Chitungwiza Connector',
    area: 'Chitungwiza / Zengeza',
    stops: 5,
    distance: 35,
    depart: '05:30 AM',
    return: '14:30 PM',
    pupils: 35,
    capacity: 45,
    price: 75,
    status: 'Active',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'RT-007',
    name: 'Mabelreign Loop',
    area: 'Mabelreign / Warren Park',
    stops: 5,
    distance: 14,
    depart: '06:25 AM',
    return: '14:30 PM',
    pupils: 20,
    capacity: 30,
    price: 48,
    status: 'Under Review',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'RT-008',
    name: 'Ruwa Shuttle',
    area: 'Ruwa / Damofalls',
    stops: 5,
    distance: 28,
    depart: '05:45 AM',
    return: '14:30 PM',
    pupils: 0,
    capacity: 35,
    price: 65,
    status: 'Suspended',
    color: 'from-indigo-500 to-purple-600'
  }
];

export default function TransportManagementPage() {
  const [activeTab, setActiveTab] = useState('routes');
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Transport Management</h2>
          <p className="text-xs text-gray-500">Manage 8 bus routes, 8 vehicles, and 185 pupil allocations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1.5 h-9 text-xs font-medium text-gray-600 bg-white border-gray-200 hover:bg-gray-50">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button className="flex items-center gap-1.5 h-9 px-4 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm">
            <Plus className="h-3.5 w-3.5" /> Add Route
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <TransportStatCard icon={<Navigation className="h-4 w-4" />} label="Active Routes" value="6" color="bg-indigo-50 text-indigo-600" />
        <TransportStatCard icon={<Users className="h-4 w-4" />} label="Total Pupils" value="185" color="bg-teal-50 text-teal-600" />
        <TransportStatCard icon={<Bus className="h-4 w-4" />} label="Fleet Capacity" value="185/275" color="bg-amber-50 text-amber-600" />
        <TransportStatCard icon={<DollarSign className="h-4 w-4" />} label="Monthly Revenue" value="$9,250" color="bg-green-50 text-green-600" />
      </div>

      {/* Main Content Area */}
      <Card className="border-gray-100 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto custom-scrollbar">
          {['Bus Routes', 'Vehicles', 'Drivers', 'Pupil Allocation'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.toLowerCase().replace(' ', '-') 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input 
                  placeholder="Search routes..." 
                  className="pl-9 text-xs h-9 border-gray-200 outline-none focus:ring-1 focus:ring-indigo-500" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select defaultValue="All">
                <SelectTrigger className="w-[140px] h-9 text-xs bg-white border-gray-200">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Route Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {ROUTES.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.area.toLowerCase().includes(search.toLowerCase())).map((route) => (
                <div key={route.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${route.color} flex items-center justify-center text-white shadow-sm`}>
                        <Bus className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{route.name}</p>
                        <p className="text-[10px] text-gray-500">{route.id} | {route.area}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                      route.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      route.status === 'Suspended' ? 'bg-red-100 text-red-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {route.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[10px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-gray-400" /> {route.stops} stops | {route.distance} km
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-gray-400" /> Depart: {route.depart} / {route.return}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-gray-400" /> {route.pupils}/{route.capacity} pupils
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3 w-3 text-gray-400" /> ${route.price}/month per pupil
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-400 font-medium">Capacity Utilization</span>
                      <span className="font-bold text-gray-700">{Math.round((route.pupils/route.capacity) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          (route.pupils/route.capacity) > 0.9 ? 'bg-red-500' : 
                          (route.pupils/route.capacity) > 0.7 ? 'bg-amber-500' : 
                          'bg-indigo-500'
                        }`} 
                        style={{ width: `${(route.pupils/route.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TransportStatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className={`w-8 h-8 rounded-lg ${color.split(' ')[0]} ${color.split(' ')[1]} flex items-center justify-center mb-2 transition-transform group-hover:scale-110 shadow-sm`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}
