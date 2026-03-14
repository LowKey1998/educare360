
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
  AlertCircle
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
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        <p className="text-sm text-gray-500 italic">Linking your children's profiles...</p>
      </div>
    );
  }

  if (myChildren.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">No Linked Students Found</h2>
        <p className="text-sm text-gray-500">
          We couldn't find any students associated with the email <strong>{profile?.email}</strong>. 
          Please contact the school administration to link your children to your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#0D9488] rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-lg font-bold">Parent Portal</h2>
        <p className="text-sm text-white/70 mt-1">Welcome, {profile?.displayName || 'Parent'}. Track your children's progress and stay connected.</p>
        
        <div className="flex flex-wrap gap-3 mt-4">
          {myChildren.map((child) => (
            <button 
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all ${
                activeChild?.id === child.id 
                  ? 'bg-white/20 backdrop-blur-sm ring-1 ring-white/30' 
                  : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-xs font-bold shadow-inner">
                {child.studentName?.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold">{child.studentName}</p>
                <p className="text-[10px] text-white/60">{child.grade}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon={<GraduationCap className="w-4 h-4 text-blue-600" />} 
          label="Academic History" 
          value={activeChild?.marks ? Object.keys(activeChild.marks).length.toString() : '0'} 
          subValue="Subjects Graded" 
          bgColor="bg-blue-50" 
        />
        <MetricCard 
          icon={<ClipboardCheck className="w-4 h-4 text-green-600" />} 
          label="Attendance" 
          value={`${activeChild?.attendanceRate || 0}%`} 
          subValue="Term Average" 
          bgColor="bg-green-50" 
        />
        <MetricCard 
          icon={<DollarSign className="w-4 h-4 text-amber-600" />} 
          label="Fee Balance" 
          value={`$${activeChild?.feeBalance || 0}`} 
          subValue={activeChild?.feeBalance > 0 ? "Outstanding" : "Fully Paid"} 
          bgColor="bg-amber-50" 
          valueColor={activeChild?.feeBalance > 0 ? "text-red-600" : "text-green-600"}
        />
        <MetricCard 
          icon={<MessageSquare className="w-4 h-4 text-purple-600" />} 
          label="Recent Activity" 
          value={msgsLoading ? '...' : announcements.length.toString()} 
          subValue="School Updates" 
          bgColor="bg-purple-50" 
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" /> Recent School Announcements
              </h4>
              <div className="space-y-3">
                {msgsLoading ? (
                  <div className="text-center py-12 text-xs text-gray-400">Syncing announcements...</div>
                ) : announcements.length > 0 ? (
                  announcements.slice(0, 5).map((msg: any) => (
                    <UpdateItem 
                      key={msg.id}
                      title={msg.communicationType?.toUpperCase() || 'ANNOUNCEMENT'} 
                      time={new Date(msg.createdAt || Date.now()).toLocaleDateString()} 
                      desc={msg.content} 
                      sender="School Administration"
                      highlighted={msg.communicationType === 'event announcement'}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-xs text-gray-400 italic">No recent announcements from the office.</div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-500" /> Academic Performance
              </h4>
              <div className="space-y-2">
                {activeChild?.marks ? Object.entries(activeChild.marks).map(([subject, score]: [string, any]) => (
                  <div key={subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs font-semibold text-gray-700">{subject}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${score}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-800">{score}%</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-xs text-gray-400 italic">No academic marks recorded for this term yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, subValue, bgColor, valueColor = "text-gray-800" }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all group">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
          {icon}
        </div>
        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-[10px] text-gray-400 font-medium">{subValue}</p>
    </div>
  );
}

function UpdateItem({ title, time, desc, sender, highlighted = false }: any) {
  return (
    <div className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
      highlighted 
        ? 'border-blue-200 bg-blue-50/30' 
        : 'border-gray-100 bg-white'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold text-teal-600 tracking-wider">{title}</p>
        <span className="text-[10px] text-gray-400 font-medium">{time}</span>
      </div>
      <p className="text-[11px] text-gray-700 font-medium mt-1 leading-relaxed">{desc}</p>
      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-50">
        <Clock className="w-3 h-3 text-gray-300" />
        <p className="text-[9px] text-gray-400 font-medium italic">From: {sender}</p>
      </div>
    </div>
  );
}
