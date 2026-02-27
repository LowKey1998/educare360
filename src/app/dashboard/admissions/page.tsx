
"use client"

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Loader2,
  Database
} from 'lucide-react';
import { useDatabase, useRTDBCollection } from '@/firebase';

const STATUS_CONFIG: Record<string, { color: string, dot: string }> = {
  'New': { color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  'Under Review': { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  'Interview': { color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  'Accepted': { color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  'Waitlisted': { color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
  'Rejected': { color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const STATUS_LABELS = ['New', 'Under Review', 'Interview', 'Accepted', 'Waitlisted', 'Rejected'];

export default function AdmissionsPage() {
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline');
  const [search, setSearch] = useState('');
  const database = useDatabase();

  const { data: applications, loading } = useRTDBCollection(database, 'admissions');

  const filteredApps = useMemo(() => {
    if (!applications) return [];
    return applications.filter(a => 
      a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      a.applicationId?.toLowerCase().includes(search.toLowerCase())
    );
  }, [applications, search]);

  const groupedApps = useMemo(() => {
    const groups: Record<string, any[]> = {};
    STATUS_LABELS.forEach(label => groups[label] = []);
    filteredApps.forEach(app => {
      const status = app.status || 'New';
      if (groups[status]) {
        groups[status].push(app);
      } else {
        // Default to 'New' if status doesn't match our categories
        groups['New'].push(app);
      }
    });
    return groups;
  }, [filteredApps]);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Admissions & Enrolment
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-semibold rounded-full flex items-center gap-1">
              <Database className="h-2.5 w-2.5" /> Realtime Sync
            </span>
          </h2>
          <p className="text-xs text-gray-500">Manage applications, interviews, and class placement via RTDB</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button 
              onClick={() => setView('pipeline')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${view === 'pipeline' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
            >
              Pipeline
            </button>
            <button 
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${view === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
            >
              List
            </button>
          </div>
          <Button className="flex items-center gap-1.5 h-9 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-3.5 w-3.5" /> New Application
          </Button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {STATUS_LABELS.map(label => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 text-center cursor-pointer hover:shadow-md transition-all">
            <p className="text-lg font-bold text-gray-800">{loading ? '...' : (groupedApps[label]?.length || 0)}</p>
            <p className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block ${STATUS_CONFIG[label].color}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input 
            className="pl-9 text-xs h-9 border-gray-200 outline-none focus:ring-1 focus:ring-blue-500" 
            placeholder="Search applications..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Kanban Board / Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pb-6 overflow-x-auto custom-scrollbar">
        {STATUS_LABELS.map(label => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 min-w-[220px] h-fit">
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_CONFIG[label].color}`}>{label}</span>
              <span className="text-[10px] text-gray-400 font-medium">{loading ? '...' : (groupedApps[label]?.length || 0)}</span>
            </div>
            
            <div className="space-y-2">
              {groupedApps[label]?.map((app: any) => (
                <div key={app.id} className="bg-white rounded-lg p-2.5 border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${STATUS_CONFIG[label].dot}`}>
                      {getInitials(app.studentName)}
                    </div>
                    <p className="text-[11px] font-semibold text-gray-800 truncate">{app.studentName}</p>
                  </div>
                  <p className="text-[10px] text-gray-500">{app.grade || 'N/A'} | Age {app.age || 'N/A'}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                    <span className="text-[9px] text-gray-400">{app.submissionDate || 'Feb 24'}</span>
                    {app.docsPending && (
                      <span className="text-[9px] text-red-500 font-medium italic">Docs pending</span>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="animate-pulse space-y-2">
                  <div className="h-16 bg-white rounded-lg border border-gray-100" />
                  <div className="h-16 bg-white rounded-lg border border-gray-100" />
                </div>
              )}

              {!loading && groupedApps[label]?.length === 0 && (
                <div className="text-center py-8 text-[10px] text-gray-400 italic">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
