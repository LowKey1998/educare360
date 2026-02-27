"use client"

import { useState } from 'react';
import { 
  Download, 
  Plus, 
  BookOpen, 
  FileText, 
  Calendar as CalendarIcon, 
  Users, 
  MapPin, 
  X, 
  ChevronDown 
} from 'lucide-react';

const SUBJECTS = [
  { name: 'Mathematics', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'English', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'Shona', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { name: 'Science', color: 'bg-green-100 text-green-700 border-green-200' },
  { name: 'Social Studies', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { name: 'ICT', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
];

export default function TimetableCalendarPage() {
  const [activeTab, setActiveTab] = useState('timetable');

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800 font-headline">Timetable & Calendar</h2>
          <p className="text-xs text-gray-500">Class timetables, exam schedules, and academic calendar management</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Add Lesson
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<BookOpen className="w-4 h-4 text-violet-600" />} 
          label="Weekly Lessons" 
          value="39" 
          color="bg-violet-50" 
        />
        <StatCard 
          icon={<FileText className="w-4 h-4 text-red-600" />} 
          label="Upcoming Exams" 
          value="10" 
          color="bg-red-50" 
        />
        <StatCard 
          icon={<CalendarIcon className="w-4 h-4 text-blue-600" />} 
          label="Calendar Events" 
          value="14" 
          color="bg-blue-50" 
        />
        <StatCard 
          icon={<Users className="w-4 h-4 text-teal-600" />} 
          label="Classes Managed" 
          value="14" 
          color="bg-teal-50" 
        />
      </div>

      {/* Tabs and Main Content */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto custom-scrollbar">
          <TabButton 
            active={activeTab === 'timetable'} 
            onClick={() => setActiveTab('timetable')} 
            label="Weekly Timetable" 
            color="border-violet-600 text-violet-600"
          />
          <TabButton 
            active={activeTab === 'exams'} 
            onClick={() => setActiveTab('exams')} 
            label="Exam Schedule" 
            color="border-violet-600 text-violet-600"
          />
          <TabButton 
            active={activeTab === 'calendar'} 
            onClick={() => setActiveTab('calendar')} 
            label="Academic Calendar" 
            color="border-violet-600 text-violet-600"
          />
        </div>

        <div className="p-5">
          <div className="space-y-4">
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <select className="px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white font-medium focus:ring-1 focus:ring-violet-500">
                  {['Grade 1A', 'Grade 1B', 'Grade 2A', 'Grade 2B', 'Grade 3A', 'Grade 3B', 'Grade 4A', 'Grade 4B', 'Grade 5A', 'Grade 5B', 'Grade 6A', 'Grade 6B', 'Grade 7A', 'Grade 7B'].map(grade => (
                    <option key={grade}>{grade}</option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-400">Drag lessons to rearrange</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS.map(subject => (
                  <span key={subject.name} className={`px-2 py-0.5 rounded text-[9px] font-medium border ${subject.color}`}>
                    {subject.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Timetable Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                  {/* Header Row */}
                  <div className="bg-gray-50 p-2 text-[10px] font-bold text-gray-500 text-center uppercase tracking-wider">Time</div>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                    <div key={day} className="bg-gray-50 p-2 text-[10px] font-bold text-gray-700 text-center uppercase tracking-wider">{day}</div>
                  ))}

                  {/* Period 1 */}
                  <TimeSlot label="Period 1" time="07:30 - 08:10" />
                  <LessonCell subject="Mathematics" teacher="Mr. Nyathi" room="Room 3A" color="bg-blue-100 text-blue-700 border-blue-200" />
                  <LessonCell subject="English" teacher="Mrs. Moyo" room="Room 3A" color="bg-purple-100 text-purple-700 border-purple-200" />
                  <LessonCell subject="Science" teacher="Mr. Dube" room="Lab 1" color="bg-green-100 text-green-700 border-green-200" />
                  <LessonCell subject="Shona" teacher="Mrs. Moyo" room="Room 3A" color="bg-amber-100 text-amber-700 border-amber-200" />
                  <LessonCell subject="Mathematics" teacher="Mr. Nyathi" room="Room 3A" color="bg-blue-100 text-blue-700 border-blue-200" />

                  {/* Period 2 */}
                  <TimeSlot label="Period 2" time="08:10 - 08:50" />
                  <LessonCell subject="English" teacher="Mrs. Moyo" room="Room 3A" color="bg-purple-100 text-purple-700 border-purple-200" />
                  <LessonCell subject="Mathematics" teacher="Mr. Nyathi" room="Room 3A" color="bg-blue-100 text-blue-700 border-blue-200" />
                  <LessonCell subject="Mathematics" teacher="Mr. Nyathi" room="Room 3A" color="bg-blue-100 text-blue-700 border-blue-200" />
                  <LessonCell subject="English" teacher="Mrs. Moyo" room="Room 3A" color="bg-purple-100 text-purple-700 border-purple-200" />
                  <LessonCell subject="Shona" teacher="Mrs. Moyo" room="Room 3A" color="bg-amber-100 text-amber-700 border-amber-200" />

                  {/* Period 3 */}
                  <TimeSlot label="Period 3" time="08:50 - 09:30" />
                  <LessonCell subject="Shona" teacher="Mrs. Moyo" room="Room 3A" color="bg-amber-100 text-amber-700 border-amber-200" />
                  <LessonCell subject="Science" teacher="Mr. Dube" room="Lab 1" color="bg-green-100 text-green-700 border-green-200" />
                  <LessonCell subject="English" teacher="Mrs. Moyo" room="Room 3A" color="bg-purple-100 text-purple-700 border-purple-200" />
                  <LessonCell subject="Mathematics" teacher="Mr. Nyathi" room="Room 3A" color="bg-blue-100 text-blue-700 border-blue-200" />
                  <LessonCell subject="Social Studies" teacher="Ms. Banda" room="Room 3A" color="bg-rose-100 text-rose-700 border-rose-200" />

                  {/* Break */}
                  <div className="p-2 text-center bg-gray-100"><p className="text-[10px] font-bold text-gray-700">Break</p><p className="text-[9px] text-gray-400">09:30 - 10:00</p></div>
                  <BreakCell />
                  <BreakCell />
                  <BreakCell />
                  <BreakCell />
                  <BreakCell />

                  {/* Period 4 */}
                  <TimeSlot label="Period 4" time="10:00 - 10:40" />
                  <LessonCell subject="Science" teacher="Mr. Dube" room="Lab 1" color="bg-green-100 text-green-700 border-green-200" />
                  <LessonCell subject="Shona" teacher="Mrs. Moyo" room="Room 3A" color="bg-amber-100 text-amber-700 border-amber-200" />
                  <LessonCell subject="Art & Craft" teacher="Mrs. Phiri" room="Art Room" color="bg-pink-100 text-pink-700 border-pink-200" />
                  <LessonCell subject="ICT" teacher="Mr. Zimba" room="Computer Lab" color="bg-cyan-100 text-cyan-700 border-cyan-200" />
                  <LessonCell subject="English" teacher="Mrs. Moyo" room="Room 3A" color="bg-purple-100 text-purple-700 border-purple-200" />

                  {/* Period 5 */}
                  <TimeSlot label="Period 5" time="10:40 - 11:20" />
                  <LessonCell subject="Social Studies" teacher="Ms. Banda" room="Room 3A" color="bg-rose-100 text-rose-700 border-rose-200" />
                  <LessonCell subject="RE" teacher="Ms. Banda" room="Room 3A" color="bg-teal-100 text-teal-700 border-teal-200" />
                  <LessonCell subject="PE" teacher="Mr. Sibanda" room="Sports Field" color="bg-orange-100 text-orange-700 border-orange-200" />
                  <LessonCell subject="Science" teacher="Mr. Dube" room="Lab 1" color="bg-green-100 text-green-700 border-green-200" />
                  <LessonCell subject="Art & Craft" teacher="Mrs. Phiri" room="Art Room" color="bg-pink-100 text-pink-700 border-pink-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2 transition-transform group-hover:scale-110 shadow-sm`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

function TabButton({ active, onClick, label, color }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
        active ? color : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );
}

function TimeSlot({ label, time }: any) {
  return (
    <div className="p-2 text-center bg-white border-r border-gray-100">
      <p className="text-[10px] font-semibold text-gray-700">{label}</p>
      <p className="text-[9px] text-gray-400">{time}</p>
    </div>
  );
}

function LessonCell({ subject, teacher, room, color }: any) {
  return (
    <div className="bg-white p-1 min-h-[65px]">
      <div draggable="true" className={`h-full rounded-lg border p-1.5 cursor-grab active:cursor-grabbing group relative transition-all hover:shadow-md ${color}`}>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold truncate leading-tight">{subject}</p>
            <p className="text-[9px] opacity-75 truncate">{teacher}</p>
            <p className="text-[8px] opacity-60 truncate flex items-center gap-0.5 mt-0.5">
              <MapPin className="w-2 h-2" />{room}
            </p>
          </div>
          <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/50 transition-opacity">
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BreakCell() {
  return (
    <div className="bg-gray-100/50 p-2 flex items-center justify-center border-r border-gray-100 last:border-r-0">
      <span className="text-[9px] text-gray-400 italic font-medium">Break</span>
    </div>
  );
}
