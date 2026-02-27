
"use client"

import { useState } from 'react';
import { 
  GraduationCap, 
  ClipboardCheck, 
  DollarSign, 
  MessageSquare,
  ChevronDown
} from 'lucide-react';

export default function ParentPortalPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChild, setSelectedChild] = useState('tendai');

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#0D9488] rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-lg font-bold">Parent Portal</h2>
        <p className="text-sm text-white/70 mt-1">Welcome, Mr. James Moyo. Track your children's progress and stay connected.</p>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <button 
            onClick={() => setSelectedChild('tendai')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all ${
              selectedChild === 'tendai' 
                ? 'bg-white/20 backdrop-blur-sm ring-1 ring-white/30' 
                : 'bg-white/10 hover:bg-white/15'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shadow-inner">TM</div>
            <div className="text-left">
              <p className="text-xs font-semibold">Tendai Moyo</p>
              <p className="text-[10px] text-white/60">Grade 2A</p>
            </div>
          </button>
          
          <button 
            onClick={() => setSelectedChild('nyasha')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all ${
              selectedChild === 'nyasha' 
                ? 'bg-white/20 backdrop-blur-sm ring-1 ring-white/30' 
                : 'bg-white/10 hover:bg-white/15'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shadow-inner">NM</div>
            <div className="text-left">
              <p className="text-xs font-semibold">Nyasha Moyo</p>
              <p className="text-[10px] text-white/60">Reception A</p>
            </div>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon={<GraduationCap className="w-4 h-4 text-blue-600" />} 
          label="Academic" 
          value="78%" 
          subValue="Position 3 of 46" 
          bgColor="bg-blue-50" 
        />
        <MetricCard 
          icon={<ClipboardCheck className="w-4 h-4 text-green-600" />} 
          label="Attendance" 
          value="96.5%" 
          subValue="This term" 
          bgColor="bg-green-50" 
        />
        <MetricCard 
          icon={<DollarSign className="w-4 h-4 text-amber-600" />} 
          label="Fee Balance" 
          value="$0" 
          subValue="Fully paid" 
          bgColor="bg-amber-50" 
          valueColor="text-green-600"
        />
        <MetricCard 
          icon={<MessageSquare className="w-4 h-4 text-purple-600" />} 
          label="Messages" 
          value="2" 
          subValue="Unread messages" 
          bgColor="bg-purple-50" 
        />
      </div>

      {/* Tabs and Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto custom-scrollbar">
          {['Overview', 'Academic Progress', 'Fee Statements', 'ECD Activity Feed', 'Messages'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.toLowerCase() 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Events Column */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Upcoming Events</h4>
              <div className="space-y-3">
                <EventItem month="Feb" day="25" title="Parent-Teacher Conference" time="2:00 PM" color="bg-blue-400" />
                <EventItem month="Mar" day="01" title="Term 1 Exams Begin" time="All Day" color="bg-blue-400" />
                <EventItem month="Mar" day="05" title="Sports Day" time="8:00 AM" color="bg-blue-400" />
                <EventItem month="Mar" day="10" title="ECD Open Day" time="9:00 AM" color="bg-blue-400" />
              </div>
            </div>

            {/* Updates Column */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Recent Updates</h4>
              <div className="space-y-3">
                <UpdateItem 
                  title="Term 1 Progress Update" 
                  time="2 hrs ago" 
                  desc="Dear parent, I wanted to share some positive feedback about Tendai..." 
                  sender="Mrs. Chikwanha"
                  highlighted
                />
                <UpdateItem 
                  title="Sports Day - March 5th" 
                  time="1 day ago" 
                  desc="We are excited to announce our annual Sports Day event..." 
                  sender="School Admin"
                  highlighted
                />
                <UpdateItem 
                  title="Mathematics Homework" 
                  time="2 days ago" 
                  desc="Please ensure Tendai completes the worksheet by Friday..." 
                  sender="Mr. Nyathi"
                />
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
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-[10px] text-gray-400 font-medium">{subValue}</p>
    </div>
  );
}

function EventItem({ month, day, title, time, color }: any) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="text-center min-w-[36px]">
        <p className="text-[10px] text-gray-400 uppercase font-medium">{month}</p>
        <p className="text-base font-bold text-gray-800 leading-tight">{day}</p>
      </div>
      <div className={`w-0.5 h-8 ${color} rounded-full group-hover:scale-y-110 transition-transform`} />
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-700 truncate group-hover:text-blue-600 transition-colors">{title}</p>
        <p className="text-[10px] text-gray-400">{time}</p>
      </div>
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
        <p className="text-xs font-semibold text-gray-800">{title}</p>
        <span className="text-[10px] text-gray-400 font-medium">{time}</span>
      </div>
      <p className="text-[11px] text-gray-500 line-clamp-1">{desc}</p>
      <p className="text-[10px] text-gray-400 mt-1 font-medium">From: {sender}</p>
    </div>
  );
}
