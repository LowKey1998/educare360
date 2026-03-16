
"use client"

import { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  ClipboardCheck, 
  DollarSign, 
  MessageSquare,
  Clock,
  Calendar,
  Loader2,
  AlertCircle,
  Heart,
  Database,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useUserProfile, useDatabase, useRTDBCollection } from '@/firebase';

export default function ParentPortalPage() {
  const { profile } = useUserProfile();
  const database = useDatabase();
  const { data: students, loading: studentsLoading } = useRTDBCollection(database, 'students');
  const { data: announcements, loading: msgsLoading } = useRTDBCollection(database, 'announcements');
  
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const myChildren = useMemo(() => {
    if (!students || !profile?.email) return [];
    return students.filter(s => s.parentEmail?.toLowerCase() === profile.email?.toLowerCase());
  }, [students, profile?.email]);

  const activeChild = useMemo(() => {
    if (selectedChildId) return myChildren.find(c => c.id === selectedChildId);
    return myChildren[0];
  }, [myChildren, selectedChildId]);

  if (studentsLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-rose-600" />
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Linking Family Profiles...</p>
      </div>
    );
  }

  if (myChildren.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 animate-bounce">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">No Linked Family Profiles</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          We couldn't find any students associated with <strong>{profile?.email}</strong>. 
          Please contact the school office to verify your email address in the institutional pupil registry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Parent Header */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="30" r="80" fill="white" />
            <circle cx="50" cy="180" r="100" fill="white" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Welcome, {profile?.displayName || 'Parent'}</h2>
              <p className="text-xs text-white/80">Managing Family Progress at Sunrise Academy</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {myChildren.map((child) => (
              <button 
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all border ${
                  activeChild?.id === child.id 
                    ? 'bg-white text-rose-600 border-white shadow-md scale-105' 
                    : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-inner ${
                  activeChild?.id === child.id ? 'bg-rose-50' : 'bg-white/20'
                }`}>
                  {child.studentName?.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold truncate max-w-[120px]">{child.studentName}</p>
                  <p className={`text-[9px] font-bold uppercase ${activeChild?.id === child.id ? 'text-rose-400' : 'text-white/60'}`}>{child.grade}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ParentMetricCard icon={<Award className="w-4 h-4 text-rose-600" />} label="Subjects Graded" value={activeChild?.marks ? Object.keys(activeChild.marks).length.toString() : '0'} color="bg-rose-50" />
        <ParentMetricCard icon={<TrendingUp className="w-4 h-4 text-emerald-600" />} label="Attendance Rate" value={`${activeChild?.attendanceRate || 0}%`} color="bg-emerald-50" />
        <ParentMetricCard icon={<DollarSign className="w-4 h-4 text-amber-600" />} label="Fee Balance" value={`$${activeChild?.feeBalance || 0}`} color="bg-amber-50" 
          valueColor={parseFloat(activeChild?.feeBalance) > 0 ? "text-rose-600" : "text-emerald-600"} />
        <ParentMetricCard icon={<MessageSquare className="w-4 h-4 text-blue-600" />} label="Updates" value={msgsLoading ? '...' : announcements.length.toString()} color="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Overview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tight">
              <GraduationCap className="w-4 h-4 text-rose-500" /> Academic Performance
            </h4>
            <span className="text-[10px] font-bold text-gray-400">TERM 1 2026</span>
          </div>
          <div className="p-5 space-y-3">
            {activeChild?.marks ? Object.entries(activeChild.marks).map(([subject, score]: [string, any]) => (
              <div key={subject} className="flex flex-col gap-1.5 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">{subject}</span>
                  <span className="text-xs font-bold text-rose-600">{score}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${score}%` }} 
                  />
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-gray-400 italic text-xs">No marks recorded yet.</div>
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tight">
              <Calendar className="w-4 h-4 text-blue-500" /> School Communications
            </h4>
            <button className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1">
              VIEW ARCHIVE <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="p-5 space-y-3">
            {msgsLoading ? (
              <div className="py-12 text-center text-[10px] text-gray-400 font-bold uppercase animate-pulse">Syncing Announcements...</div>
            ) : announcements.length > 0 ? (
              announcements.slice(0, 5).map((msg: any) => (
                <div key={msg.id} className="p-4 rounded-xl border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 transition-all cursor-default">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700 uppercase tracking-tighter">
                      {msg.communicationType || 'General Update'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">{new Date(msg.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">{msg.content}</p>
                  <div className="flex items-center gap-1.5 mt-3 text-[9px] text-gray-400 italic">
                    <Clock className="w-3 h-3" />
                    <span>Office of Administration</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 italic text-xs">No recent updates.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParentMetricCard({ icon, label, value, color, valueColor = "text-gray-800" }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>{icon}</div>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active</span>
      </div>
      <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{label}</p>
    </div>
  );
}
