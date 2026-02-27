
"use client"

import { useState, useMemo } from 'react';
import { 
  Download, 
  Plus, 
  Users, 
  Briefcase, 
  Calendar, 
  Award, 
  Search, 
  Phone, 
  Mail,
  ChevronDown
} from 'lucide-react';

const STAFF_DATA = [
  { id: '1', name: 'Mrs. Tendai Chikwanha', role: 'ECD Teacher', dept: 'ECD', phone: '+263 77 111 2233', email: 'tchikwanha@sunrise.edu', qualification: 'Diploma in ECD', rating: 4.8, status: 'Active', initials: 'TC', gradient: 'from-rose-400 to-pink-500' },
  { id: '2', name: 'Mr. Simba Nyathi', role: 'Mathematics Teacher', dept: 'Academic', phone: '+263 71 222 3344', email: 'snyathi@sunrise.edu', qualification: 'B.Ed Mathematics', rating: 4.5, status: 'Active', initials: 'SN', gradient: 'from-rose-400 to-pink-500' },
  { id: '3', name: 'Mrs. Grace Moyo', role: 'Shona Teacher', dept: 'Academic', phone: '+263 78 333 4455', email: 'gmoyo@sunrise.edu', qualification: 'B.Ed Languages', rating: 4.6, status: 'Active', initials: 'GM', gradient: 'from-rose-400 to-pink-500' },
  { id: '4', name: 'Mr. Thomas Dube', role: 'Science Teacher', dept: 'Academic', phone: '+263 77 444 5566', email: 'tdube@sunrise.edu', qualification: 'B.Sc Education', rating: 4.3, status: 'On Leave', initials: 'TD', gradient: 'from-rose-400 to-pink-500' },
  { id: '5', name: 'Ms. Chipo Banda', role: 'Social Studies Teacher', dept: 'Academic', phone: '+263 71 555 6677', email: 'cbanda@sunrise.edu', qualification: 'B.Ed Social Studies', rating: 4.7, status: 'Active', initials: 'CB', gradient: 'from-rose-400 to-pink-500' },
  { id: '6', name: 'Mrs. Ruth Ncube', role: 'Admin Officer', dept: 'Administration', phone: '+263 78 666 7788', email: 'rncube@sunrise.edu', qualification: 'Diploma in Admin', rating: 4.4, status: 'Active', initials: 'RN', gradient: 'from-rose-400 to-pink-500' },
  { id: '7', name: 'Mr. David Zimba', role: 'ICT Teacher', dept: 'Academic', phone: '+263 77 777 8899', email: 'dzimba@sunrise.edu', qualification: 'B.Sc Computer Science', rating: 4.2, status: 'Active', initials: 'DZ', gradient: 'from-rose-400 to-pink-500' },
  { id: '8', name: 'Mr. Peter Sibanda', role: 'PE Teacher', dept: 'Academic', phone: '+263 71 888 9900', email: 'psibanda@sunrise.edu', qualification: 'Diploma in Sports Science', rating: 4.1, status: 'Active', initials: 'PS', gradient: 'from-rose-400 to-pink-500' },
  { id: '9', name: 'Mrs. Linda Phiri', role: 'Art & Craft Teacher', dept: 'Academic', phone: '+263 78 999 0011', email: 'lphiri@sunrise.edu', qualification: 'B.Ed Fine Arts', rating: 4.9, status: 'Active', initials: 'LP', gradient: 'from-rose-400 to-pink-500' },
  { id: '10', name: 'Mr. Joseph Mutasa', role: 'School Head', dept: 'Management', phone: '+263 77 000 1122', email: 'jmutasa@sunrise.edu', qualification: 'M.Ed Administration', rating: 4.7, status: 'Active', initials: 'JM', gradient: 'from-rose-400 to-pink-500' },
  { id: '11', name: 'Mrs. Sarah Gumbo', role: 'Deputy Head', dept: 'Management', phone: '+263 71 112 2334', email: 'sgumbo@sunrise.edu', qualification: 'M.Ed Curriculum', rating: 4.6, status: 'Active', initials: 'SG', gradient: 'from-rose-400 to-pink-500' },
  { id: '12', name: 'Mr. Brian Mapfumo', role: 'Accounts Officer', dept: 'Finance', phone: '+263 78 223 3445', email: 'bmapfumo@sunrise.edu', qualification: 'B.Com Accounting', rating: 4.3, status: 'Active', initials: 'BM', gradient: 'from-rose-400 to-pink-500' },
];

export default function HRPage() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const filteredStaff = useMemo(() => {
    return STAFF_DATA.filter(staff => {
      const matchesSearch = staff.name.toLowerCase().includes(search.toLowerCase()) || 
                           staff.role.toLowerCase().includes(search.toLowerCase());
      const matchesDept = deptFilter === 'All' || staff.dept === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [search, deptFilter]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">HR & Staff Management</h2>
          <p className="text-xs text-gray-500">Manage {STAFF_DATA.length} staff members, leave, and performance</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Add Staff
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-4 h-4 text-blue-600" />} label="Total Staff" value="86" color="bg-blue-50" />
        <StatCard icon={<Briefcase className="w-4 h-4 text-teal-600" />} label="Teachers" value="62" color="bg-teal-50" />
        <StatCard icon={<Calendar className="w-4 h-4 text-amber-600" />} label="On Leave" value="4" color="bg-amber-50" />
        <StatCard icon={<Award className="w-4 h-4 text-purple-600" />} label="Avg Rating" value="4.5" color="bg-purple-50" />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto custom-scrollbar">
          <button className="px-4 py-3 text-xs font-medium border-b-2 transition-colors border-rose-600 text-rose-600 whitespace-nowrap">Staff Directory</button>
          <button className="px-4 py-3 text-xs font-medium border-b-2 transition-colors border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">Leave Management</button>
          <button className="px-4 py-3 text-xs font-medium border-b-2 transition-colors border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">Performance</button>
        </div>

        <div className="p-5">
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search staff..." 
                  className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-rose-500/20 focus:border-rose-500" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select 
                className="px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white focus:border-rose-500"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="ECD">ECD</option>
                <option value="Academic">Academic</option>
                <option value="Administration">Administration</option>
                <option value="Management">Management</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredStaff.map((staff) => (
                <StaffCard key={staff.id} staff={staff} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all group">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

function StaffCard({ staff }: any) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group hover:border-rose-100">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${staff.gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
          {staff.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-rose-600 transition-colors">{staff.name}</p>
          <p className="text-[10px] text-gray-500">{staff.role}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
          staff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {staff.status}
        </span>
      </div>
      <div className="space-y-1.5 text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3 h-3 text-gray-400" /> {staff.phone}
        </div>
        <div className="flex items-center gap-1.5">
          <Mail className="w-3 h-3 text-gray-400" /> {staff.email}
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3 h-3 text-gray-400" /> {staff.dept} | {staff.qualification}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`w-2.5 h-2.5 rounded-full ${i < Math.floor(staff.rating) ? 'bg-amber-400' : 'bg-gray-200'}`} 
          />
        ))}
        <span className="text-[10px] text-gray-400 ml-1 font-medium">{staff.rating}</span>
      </div>
    </div>
  );
}
