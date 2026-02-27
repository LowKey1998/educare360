"use client"

import { useState } from 'react';
import { 
  BookOpen, 
  Printer, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  LayoutGrid, 
  Users, 
  FileText, 
  ClipboardList, 
  Grid3X3, 
  Calendar, 
  Package, 
  Search, 
  MapPin, 
  Eye, 
  Pen, 
  Trash2, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export default function ClassroomManagementPage() {
  const [activeTab, setActiveTab] = useState('classrooms');

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            Classroom Management
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage 14 classrooms, 6 lesson plans, and 8 assignments</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Active Classrooms" 
          value="14" 
          trend="1 under maintenance" 
          trendIcon={<TrendingUp className="w-2.5 h-2.5" />}
          trendColor="text-green-600"
          icon={<LayoutGrid className="w-[18px] h-[18px] text-blue-600" />} 
          color="bg-blue-50" 
        />
        <StatCard 
          label="Total Enrollment" 
          value="364" 
          trend="71% capacity" 
          trendIcon={<TrendingUp className="w-2.5 h-2.5" />}
          trendColor="text-green-600"
          icon={<Users className="w-[18px] h-[18px] text-purple-600" />} 
          color="bg-purple-50" 
        />
        <StatCard 
          label="Lesson Plans" 
          value="6" 
          trend="4 planned, 2 completed" 
          trendIcon={<TrendingUp className="w-2.5 h-2.5" />}
          trendColor="text-green-600"
          icon={<FileText className="w-[18px] h-[18px] text-amber-600" />} 
          color="bg-amber-50" 
        />
        <StatCard 
          label="Pending Assignments" 
          value="4" 
          trend="2 overdue" 
          trendIcon={<TrendingDown className="w-2.5 h-2.5" />}
          trendColor="text-red-600"
          icon={<ClipboardList className="w-[18px] h-[18px] text-red-600" />} 
          color="bg-red-50" 
        />
      </div>

      {/* Tabs and Main Content */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-100 px-2 overflow-x-auto custom-scrollbar">
          <TabButton 
            active={activeTab === 'classrooms'} 
            onClick={() => setActiveTab('classrooms')} 
            icon={<LayoutGrid className="w-3.5 h-3.5" />} 
            label="Classrooms" 
            badge="1" 
            badgeColor="bg-amber-100 text-amber-600"
          />
          <TabButton 
            active={activeTab === 'seating'} 
            onClick={() => setActiveTab('seating')} 
            icon={<Grid3X3 className="w-3.5 h-3.5" />} 
            label="Seating Charts" 
          />
          <TabButton 
            active={activeTab === 'timetable'} 
            onClick={() => setActiveTab('timetable')} 
            icon={<Calendar className="w-3.5 h-3.5" />} 
            label="Timetable View" 
          />
          <TabButton 
            active={activeTab === 'lessons'} 
            onClick={() => setActiveTab('lessons')} 
            icon={<FileText className="w-3.5 h-3.5" />} 
            label="Lesson Plans" 
            badge="4" 
            badgeColor="bg-blue-100 text-blue-600"
          />
          <TabButton 
            active={activeTab === 'assignments'} 
            onClick={() => setActiveTab('assignments')} 
            icon={<ClipboardList className="w-3.5 h-3.5" />} 
            label="Assignments" 
            badge="2" 
            badgeColor="bg-red-100 text-red-600"
          />
          <TabButton 
            active={activeTab === 'resources'} 
            onClick={() => setActiveTab('resources')} 
            icon={<Package className="w-3.5 h-3.5" />} 
            label="Room Resources" 
          />
        </div>

        <div className="p-5">
          <div className="space-y-4">
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search classrooms..." 
                    className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg w-56 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" 
                  />
                </div>
                <select className="text-xs border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none bg-white">
                  <option value="all">All Grades</option>
                  <option value="ECD A">ECD A</option>
                  <option value="ECD B">ECD B</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                </select>
                <select className="text-xs border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none bg-white">
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
                <BookOpen className="w-3.5 h-3.5" /> Add Classroom
              </button>
            </div>

            <p className="text-xs text-gray-500">15 classrooms found</p>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">Classroom</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">Grade</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">Teacher</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">Location</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-600">Capacity</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-600">Enrolled</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">Status</th>
                    <th className="text-right py-3 px-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <ClassroomRow 
                    id="CLS-001"
                    name="ECD A - Sunflower"
                    section="Section A"
                    grade="ECD A"
                    gradeColor="bg-pink-100 text-pink-700"
                    teacher="Mrs. Tendai Chikwanha"
                    assistant="Ms. Memory Dube"
                    location="Block A · A-101"
                    capacity={25}
                    enrolled={22}
                    enrolledColor="text-amber-600"
                    barColor="bg-amber-400"
                    status="Active"
                    statusColor="bg-emerald-100 text-emerald-700"
                  />
                  <ClassroomRow 
                    id="CLS-002"
                    name="ECD B - Butterfly"
                    section="Section A"
                    grade="ECD B"
                    gradeColor="bg-rose-100 text-rose-700"
                    teacher="Mrs. Joyce Mapfumo"
                    assistant="Ms. Rudo Nyoni"
                    location="Block A · A-102"
                    capacity={25}
                    enrolled={24}
                    enrolledColor="text-red-600"
                    barColor="bg-red-400"
                    status="Active"
                    statusColor="bg-emerald-100 text-emerald-700"
                  />
                  <ClassroomRow 
                    id="CLS-003"
                    name="Grade 1A"
                    section="Section A"
                    grade="Grade 1"
                    gradeColor="bg-red-100 text-red-700"
                    teacher="Mrs. Sarah Gumbo"
                    location="Block A · A-201"
                    capacity={35}
                    enrolled={32}
                    enrolledColor="text-red-600"
                    barColor="bg-red-400"
                    status="Active"
                    statusColor="bg-emerald-100 text-emerald-700"
                  />
                  <ClassroomRow 
                    id="CLS-004"
                    name="Grade 1B"
                    section="Section B"
                    grade="Grade 1"
                    gradeColor="bg-red-100 text-red-700"
                    teacher="Mrs. Nyasha Banda"
                    location="Block A · A-202"
                    capacity={35}
                    enrolled={30}
                    enrolledColor="text-amber-600"
                    barColor="bg-amber-400"
                    status="Active"
                    statusColor="bg-emerald-100 text-emerald-700"
                  />
                  <ClassroomRow 
                    id="CLS-005"
                    name="Grade 2A"
                    section="Section A"
                    grade="Grade 2"
                    gradeColor="bg-orange-100 text-orange-700"
                    teacher="Mr. Simba Nyathi"
                    location="Block A · A-203"
                    capacity={35}
                    enrolled={33}
                    enrolledColor="text-red-600"
                    barColor="bg-red-400"
                    status="Active"
                    statusColor="bg-emerald-100 text-emerald-700"
                  />
                  <ClassroomRow 
                    id="CLS-006"
                    name="Grade 3A"
                    section="Section A"
                    grade="Grade 3"
                    gradeColor="bg-amber-100 text-amber-700"
                    teacher="Mrs. Grace Moyo"
                    location="Block B · B-101"
                    capacity={40}
                    enrolled={36}
                    enrolledColor="text-amber-600"
                    barColor="bg-amber-400"
                    status="Active"
                    statusColor="bg-emerald-100 text-emerald-700"
                  />
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <span className="text-[10px] text-gray-400">Page 1 of 2</span>
              <div className="flex gap-1">
                <button disabled className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, trendIcon, trendColor, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${color} ${icon.props.className.split(' ').find((c: string) => c.startsWith('text-'))}`}>{label}</span>
        <span className={`text-[10px] font-medium flex items-center gap-0.5 ${trendColor}`}>
          {trendIcon} {trend}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, badge, badgeColor }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
        active 
          ? 'border-teal-600 text-teal-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      {label}
      {badge && (
        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function ClassroomRow({ 
  id, name, section, grade, gradeColor, teacher, assistant, location, capacity, enrolled, enrolledColor, barColor, status, statusColor 
}: any) {
  const percent = (enrolled / capacity) * 100;
  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      <td className="py-3 px-3">
        <div className="font-medium text-gray-800">{name}</div>
        <div className="text-gray-400 text-[10px]">{id} · {section}</div>
      </td>
      <td className="py-3 px-3">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${gradeColor}`}>{grade}</span>
      </td>
      <td className="py-3 px-3">
        <div className="text-gray-700">{teacher}</div>
        {assistant && <div className="text-gray-400 text-[10px]">Asst: {assistant}</div>}
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin className="w-3 h-3 text-gray-400" /> {location}
        </div>
      </td>
      <td className="py-3 px-3 text-center text-gray-700">{capacity}</td>
      <td className="py-3 px-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className={`font-medium ${enrolledColor}`}>{enrolled}</span>
          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }}></div>
          </div>
        </div>
      </td>
      <td className="py-3 px-3">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor}`}>{status}</span>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center justify-end gap-1">
          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors" title="Edit">
            <Pen className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
