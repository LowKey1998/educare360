
"use client"

import { useState } from 'react';
import { 
  Plus, 
  BookOpen, 
  Star, 
  TrendingUp, 
  Heart, 
  Smile, 
  Eye,
  Check
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const radarData = [
  { subject: 'Language', A: 78, B: 85, fullMark: 100 },
  { subject: 'Numeracy', A: 65, B: 75, fullMark: 100 },
  { subject: 'Physical', A: 85, B: 90, fullMark: 100 },
  { subject: 'Social', A: 72, B: 82, fullMark: 100 },
  { subject: 'Creative', A: 90, B: 95, fullMark: 100 },
  { subject: 'Environmental', A: 60, B: 70, fullMark: 100 },
];

export default function ECDDevelopmentPage() {
  const [activeTab, setActiveTab] = useState('milestones');

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">ECD Development Management</h2>
          <p className="text-xs text-gray-500">Track milestones, daily routines, and development for Baby Class to Reception</p>
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-teal-500 outline-none bg-white">
            <option>All Classes</option>
            <option>Baby Class</option>
            <option>Middle Class</option>
            <option>Reception</option>
          </select>
          <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Add Observation
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('milestones')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'milestones' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Milestones & Skills
          </button>
          <button 
            onClick={() => setActiveTab('routines')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'routines' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Daily Routines
          </button>
          <button 
            onClick={() => setActiveTab('observations')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'observations' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Observation Journal
          </button>
          <button 
            onClick={() => setActiveTab('pupils')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pupils' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            ECD Pupils
          </button>
        </div>

        <div className="p-5">
          <div className="space-y-5">
            {/* Top Analysis Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
              {/* Radar Chart Section */}
              <div className="lg:col-span-1 bg-gray-50 rounded-xl p-4 border border-gray-100/50">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">Term Comparison - Development Areas</h4>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#ccc', fontSize: 9 }} />
                      <Radar
                        name="Term 1"
                        dataKey="A"
                        stroke="#C4B5FD"
                        fill="#C4B5FD"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Term 2"
                        dataKey="B"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.3}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 justify-center mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#C4B5FD]" />
                    <span className="text-[10px] text-gray-500">Term 1</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                    <span className="text-[10px] text-gray-500">Term 2</span>
                  </div>
                </div>
              </div>

              {/* Milestones Cards Grid */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <DevelopmentCard 
                  icon={<BookOpen className="w-4 h-4 text-blue-600" />}
                  title="Language & Communication"
                  progress={78}
                  bgColor="bg-blue-50"
                  skills={[
                    { label: "Speaks in full sentences", completed: true },
                    { label: "Follows 2-step instructions", completed: true },
                    { label: "Identifies letters A-Z", completed: false },
                    { label: "Retells simple stories", completed: true },
                  ]}
                />
                <DevelopmentCard 
                  icon={<Star className="w-4 h-4 text-purple-600" />}
                  title="Numeracy & Maths"
                  progress={65}
                  bgColor="bg-purple-50"
                  skills={[
                    { label: "Counts to 20", completed: true },
                    { label: "Recognizes shapes", completed: true },
                    { label: "Sorts by color/size", completed: true },
                    { label: "Simple addition", completed: false },
                  ]}
                />
                <DevelopmentCard 
                  icon={<TrendingUp className="w-4 h-4 text-green-600" />}
                  title="Physical Development"
                  progress={85}
                  bgColor="bg-green-50"
                  skills={[
                    { label: "Runs and jumps confidently", completed: true },
                    { label: "Holds pencil correctly", completed: true },
                    { label: "Cuts with scissors", completed: true },
                    { label: "Balances on one foot", completed: false },
                  ]}
                />
                <DevelopmentCard 
                  icon={<Heart className="w-4 h-4 text-rose-600" />}
                  title="Social & Emotional"
                  progress={72}
                  bgColor="bg-rose-50"
                  skills={[
                    { label: "Shares with peers", completed: true },
                    { label: "Expresses feelings verbally", completed: false },
                    { label: "Follows classroom rules", completed: true },
                    { label: "Shows empathy", completed: true },
                  ]}
                />
                <DevelopmentCard 
                  icon={<Smile className="w-4 h-4 text-amber-600" />}
                  title="Creative Arts"
                  progress={90}
                  bgColor="bg-amber-50"
                  skills={[
                    { label: "Draws recognizable figures", completed: true },
                    { label: "Sings songs from memory", completed: true },
                    { label: "Uses colors purposefully", completed: true },
                    { label: "Engages in role play", completed: true },
                  ]}
                />
                <DevelopmentCard 
                  icon={<Eye className="w-4 h-4 text-teal-600" />}
                  title="Environmental Awareness"
                  progress={60}
                  bgColor="bg-teal-50"
                  skills={[
                    { label: "Names common animals", completed: true },
                    { label: "Identifies weather types", completed: true },
                    { label: "Understands seasons", completed: false },
                    { label: "Basic hygiene awareness", completed: true },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DevelopmentCard({ icon, title, progress, bgColor, skills }: any) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all group">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-1000" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-gray-500">{progress}%</span>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        {skills.map((skill: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 text-[11px]">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              skill.completed ? 'border-green-500 bg-green-500' : 'border-gray-300'
            }`}>
              {skill.completed && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className={skill.completed ? 'text-gray-700' : 'text-gray-400'}>{skill.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
