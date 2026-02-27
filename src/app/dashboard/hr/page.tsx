
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
  Loader2
} from 'lucide-react';
import { useDatabase, useRTDBCollection } from '@/firebase';

export default function HRPage() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const database = useDatabase();

  const { data: users, loading } = useRTDBCollection(database, 'users');

  const staffList = useMemo(() => {
    return users.filter(u => u.role === 'admin' || u.role === 'staff');
  }, [users]);

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      const matchesSearch = 
        staff.displayName?.toLowerCase().includes(search.toLowerCase()) || 
        staff.email?.toLowerCase().includes(search.toLowerCase());
      const matchesDept = deptFilter === 'All' || staff.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [staffList, search, deptFilter]);

  const stats = useMemo(() => {
    return {
      total: staffList.length,
      teachers: staffList.filter(s => s.role === 'staff').length,
      admins: staffList.filter(s => s.role === 'admin').length,
    };
  }, [staffList]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">HR & Staff Management</h2>
          <p className="text-xs text-gray-500">Manage institutional staff and performance records</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Add Staff
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-4 h-4 text-blue-600" />} label="Total Staff" value={loading ? '...' : stats.total.toString()} color="bg-blue-50" />
        <StatCard icon={<Briefcase className="w-4 h-4 text-teal-600" />} label="Teachers" value={loading ? '...' : stats.teachers.toString()} color="bg-teal-50" />
        <StatCard icon={<Award className="w-4 h-4 text-purple-600" />} label="Admins" value={loading ? '...' : stats.admins.toString()} color="bg-purple-50" />
        <StatCard icon={<Calendar className="w-4 h-4 text-amber-600" />} label="Active" value={loading ? '...' : stats.total.toString()} color="bg-amber-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="space-y-4">
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
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-2" />
                <p className="text-xs text-gray-400 italic">Syncing staff directory...</p>
              </div>
            ) : filteredStaff.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredStaff.map((staff) => (
                  <StaffCard key={staff.id} staff={staff} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 italic text-xs">
                No staff members found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

function StaffCard({ staff }: any) {
  const initials = staff.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group hover:border-rose-100">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-rose-600 transition-colors">{staff.displayName || 'Unnamed Staff'}</p>
          <p className="text-[10px] text-gray-500 capitalize">{staff.role}</p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-green-100 text-green-700">
          Active
        </span>
      </div>
      <div className="space-y-1.5 text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <Mail className="w-3 h-3 text-gray-400" /> {staff.email}
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3 h-3 text-gray-400" /> {staff.department || 'Academic'}
        </div>
      </div>
    </div>
  );
}
