"use client"

import { 
  Building2, 
  Printer, 
  Download, 
  TrendingUp, 
  Users, 
  GraduationCap, 
  DollarSign, 
  ChartColumn, 
  GitBranch, 
  Globe, 
  Clock, 
  Eye, 
  TrendingDown, 
  TriangleAlert, 
  CircleCheck, 
  Award,
  Search
} from 'lucide-react';
import { useState } from 'react';

export default function MultiSchoolPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            Multi-School Management
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage 8 schools across 4 cities with 3,137 total pupils</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Printer className="w-3.5 h-3.5" /> Print Report
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export Data
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Schools" 
          value="8" 
          trend="7 active, 1 pending" 
          icon={<Building2 className="w-[18px] h-[18px] text-blue-600" />} 
          color="bg-blue-50" 
          textColor="text-blue-600" 
        />
        <StatCard 
          label="Total Enrollment" 
          value="3,137" 
          trend="345 new admissions" 
          icon={<Users className="w-[18px] h-[18px] text-purple-600" />} 
          color="bg-purple-50" 
          textColor="text-purple-600" 
        />
        <StatCard 
          label="Total Staff" 
          value="285" 
          trend="11.0:1 pupil-staff ratio" 
          icon={<GraduationCap className="w-[18px] h-[18px] text-teal-600" />} 
          color="bg-teal-50" 
          textColor="text-teal-600" 
        />
        <StatCard 
          label="Platform Revenue" 
          value="$1897K" 
          trend="Avg 84.8% collection" 
          icon={<DollarSign className="w-[18px] h-[18px] text-green-600" />} 
          color="bg-green-50" 
          textColor="text-green-600" 
        />
      </div>

      {/* Tabs and Content Area */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-100 px-2 overflow-x-auto custom-scrollbar">
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            icon={<ChartColumn className="w-3.5 h-3.5" />}
            label="Super Admin Overview"
          />
          <TabButton 
            active={activeTab === 'directory'} 
            onClick={() => setActiveTab('directory')} 
            icon={<Building2 className="w-3.5 h-3.5" />}
            label="School Directory"
            badge="8"
          />
          <TabButton 
            active={activeTab === 'branch'} 
            onClick={() => setActiveTab('branch')} 
            icon={<GitBranch className="w-3.5 h-3.5" />}
            label="Branch Management"
            badge="3"
          />
          <TabButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<Globe className="w-3.5 h-3.5" />}
            label="School Dashboard"
          />
          <TabButton 
            active={activeTab === 'audit'} 
            onClick={() => setActiveTab('audit')} 
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Audit Log"
            badge="10"
          />
        </div>

        <div className="p-5">
          <div className="space-y-5">
            {/* Top Insight Grid (Overview Specific) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MiniInsightCard label="Total Schools" value="8" trend="7 active" color="bg-blue-50" textColor="text-blue-600" icon={<Building2 className="w-5 h-5" />} />
              <MiniInsightCard label="Total Enrollment" value="3,137" trend="74.2% capacity" color="bg-purple-50" textColor="text-purple-600" icon={<Users className="w-5 h-5" />} />
              <MiniInsightCard label="Total Staff" value="285" trend="11.0 pupil:staff" color="bg-teal-50" textColor="text-teal-600" icon={<GraduationCap className="w-5 h-5" />} />
              <MiniInsightCard label="Platform Revenue" value="$1897K" trend="Avg 84.8% collection" color="bg-green-50" textColor="text-green-600" icon={<DollarSign className="w-5 h-5" />} />
            </div>

            {/* Trends and School Status Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Cross-School Trends</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">6-month comparison across key schools</p>
                  </div>
                  <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-transparent">
                    <option value="enrollment">Enrollment</option>
                    <option value="attendance">Attendance %</option>
                    <option value="feeCollection">Fee Collection %</option>
                    <option value="academicPerformance">Academic %</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <TrendRow month="Sep" values={[820, 398, 650]} labels={["Sunrise Main", "Sunrise Borrowdale", "Greenfield Intl"]} />
                  <TrendRow month="Oct" values={[828, 405, 658]} labels={["Sunrise Main", "Sunrise Borrowdale", "Greenfield Intl"]} />
                  <TrendRow month="Nov" values={[835, 410, 665]} labels={["Sunrise Main", "Sunrise Borrowdale", "Greenfield Intl"]} />
                  <TrendRow month="Dec" values={[835, 412, 668]} labels={["Sunrise Main", "Sunrise Borrowdale", "Greenfield Intl"]} />
                  <TrendRow month="Jan" values={[842, 418, 672]} labels={["Sunrise Main", "Sunrise Borrowdale", "Greenfield Intl"]} />
                  <TrendRow month="Feb" values={[847, 423, 678]} labels={["Sunrise Main", "Sunrise Borrowdale", "Greenfield Intl"]} />
                </div>

                <div className="flex gap-4 mt-4 pt-3 border-t border-gray-50">
                  <LegendItem color="rgb(13, 148, 136)" label="Sunrise Main" />
                  <LegendItem color="rgb(124, 58, 237)" label="Sunrise Borrowdale" />
                  <LegendItem color="rgb(5, 150, 105)" label="Greenfield Intl" />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">School Status</h3>
                <div className="space-y-2">
                  <StatusItem initial="SA" name="Sunrise Academy" pupils="847" status="Active" color="rgb(13, 148, 136)" />
                  <StatusItem initial="SA" name="Sunrise Academy - Borrowdale" pupils="423" status="Active" color="rgb(13, 148, 136)" />
                  <StatusItem initial="SA" name="Sunrise Academy - Bulawayo" pupils="312" status="Active" color="rgb(13, 148, 136)" />
                  <StatusItem initial="HP" name="Heritage Preparatory School" pupils="534" status="Active" color="rgb(29, 78, 216)" />
                  <StatusItem initial="HP" name="Heritage Prep - Chitungwiza" pupils="198" status="Active" color="rgb(29, 78, 216)" />
                  <StatusItem initial="GI" name="Greenfield International School" pupils="678" status="Active" color="rgb(5, 150, 105)" />
                  <StatusItem initial="LS" name="Little Stars ECD Centre" pupils="145" status="Active" color="rgb(236, 72, 153)" />
                  <StatusItem initial="MC" name="Masvingo Community School" pupils="0" status="Pending Setup" color="rgb(217, 119, 6)" statusColor="bg-amber-100 text-amber-700" />
                </div>
              </div>
            </div>

            {/* School Comparison Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-800">School Comparison</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-medium">Sort by:</span>
                  <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-transparent">
                    <option value="enrollment">Enrollment</option>
                    <option value="revenue">Revenue</option>
                    <option value="collection">Collection Rate</option>
                    <option value="staff">Staff Count</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-600">School</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Type</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Enrollment</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Staff</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Revenue</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Collection %</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Capacity %</th>
                      <th className="text-center px-4 py-2.5 font-semibold text-gray-600">Plan</th>
                      <th className="text-center px-4 py-2.5 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <SchoolTableRow initial="SA" name="Sunrise Academy" city="Harare" type="Main Campus" enrollment={847} staff={72} revenue="$485,000" collection="83.8%" capacity={85} plan="Enterprise" color="rgb(13, 148, 136)" />
                    <SchoolTableRow initial="GI" name="Greenfield International School" city="Harare" type="Main Campus" enrollment={678} staff={62} revenue="$520,000" collection="88.1%" capacity={85} plan="Ultimate" color="rgb(5, 150, 105)" />
                    <SchoolTableRow initial="HP" name="Heritage Preparatory School" city="Harare" type="Main Campus" enrollment={534} staff={45} revenue="$312,000" collection="85.6%" capacity={89} plan="Professional" color="rgb(29, 78, 216)" />
                    <SchoolTableRow initial="SA" name="Sunrise Academy - Borrowdale" city="Harare" type="Branch" enrollment={423} staff={38} revenue="$245,000" collection="86.9%" capacity={85} plan="Enterprise" color="rgb(13, 148, 136)" />
                    <SchoolTableRow initial="SA" name="Sunrise Academy - Bulawayo" city="Bulawayo" type="Branch" enrollment={312} staff={28} revenue="$168,000" collection="85.4%" capacity={69} plan="Professional" color="rgb(13, 148, 136)" />
                    <SchoolTableRow initial="HP" name="Heritage Prep - Chitungwiza" city="Chitungwiza" type="Satellite" enrollment={198} staff={18} revenue="$89,000" collection="79.2%" capacity={66} plan="Starter" color="rgb(29, 78, 216)" />
                    <SchoolTableRow initial="LS" name="Little Stars ECD Centre" city="Harare" type="Main Campus" enrollment={145} staff={22} revenue="$78,000" collection="84.6%" capacity={81} plan="Starter" color="rgb(236, 72, 153)" />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Revenue and Alerts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Revenue by School</h3>
                <div className="space-y-3">
                  <RevenueProgress initial="GI" name="Greenfield International School" amount="$520,000" percent={27.4} color="rgb(5, 150, 105)" />
                  <RevenueProgress initial="SA" name="Sunrise Academy" amount="$485,000" percent={25.6} color="rgb(13, 148, 136)" />
                  <RevenueProgress initial="HP" name="Heritage Preparatory School" amount="$312,000" percent={16.4} color="rgb(29, 78, 216)" />
                  <RevenueProgress initial="SA" name="Sunrise Academy - Borrowdale" amount="$245,000" percent={12.9} color="rgb(13, 148, 136)" />
                  <RevenueProgress initial="SA" name="Sunrise Academy - Bulawayo" amount="$168,000" percent={8.9} color="rgb(13, 148, 136)" />
                  <RevenueProgress initial="HP" name="Heritage Prep - Chitungwiza" amount="$89,000" percent={4.7} color="rgb(29, 78, 216)" />
                  <RevenueProgress initial="LS" name="Little Stars ECD Centre" amount="$78,000" percent={4.1} color="rgb(236, 72, 153)" />
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Total Platform Revenue</span>
                  <span className="text-sm font-bold text-gray-800">$1,897,000</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Alerts & Insights</h3>
                <div className="space-y-2.5">
                  <AlertItem 
                    icon={<TriangleAlert className="w-3.5 h-3.5 text-amber-600" />} 
                    title="Pending Setup" 
                    desc="Masvingo Community School needs configuration" 
                    color="bg-amber-50" 
                    titleColor="text-amber-800" 
                    descColor="text-amber-700" 
                  />
                  <AlertItem 
                    icon={<TrendingDown className="w-3.5 h-3.5 text-red-600" />} 
                    title="Low Fee Collection" 
                    desc="Heritage Prep - Chitungwiza at 79.2% collection rate" 
                    color="bg-red-50" 
                    titleColor="text-red-800" 
                    descColor="text-red-700" 
                  />
                  <AlertItem 
                    icon={<CircleCheck className="w-3.5 h-3.5 text-green-600" />} 
                    title="Top Performer" 
                    desc="Greenfield International leads with 88.1% fee collection and 82.8% academic performance" 
                    color="bg-green-50" 
                    titleColor="text-green-800" 
                    descColor="text-green-700" 
                  />
                  <AlertItem 
                    icon={<Award className="w-3.5 h-3.5 text-purple-600" />} 
                    title="Growth Leader" 
                    desc="Sunrise Borrowdale added 42 new admissions this term (+10.5%)" 
                    color="bg-purple-50" 
                    titleColor="text-purple-800" 
                    descColor="text-purple-700" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon, color, textColor }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${color} ${textColor}`}>{label}</span>
        <span className="text-[10px] font-medium flex items-center gap-0.5 text-green-600">
          <TrendingUp className="w-2.5 h-2.5" /> {trend}
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

function MiniInsightCard({ label, value, trend, color, textColor, icon }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${color} ${textColor}`}>{label}</span>
        <span className="text-[10px] font-medium text-green-600 flex items-center gap-0.5">
          <TrendingUp className="w-2.5 h-2.5" /> {trend}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, badge }: any) {
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
        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
          active ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function TrendRow({ month, values }: any) {
  const maxValue = 847; // Max enrollment for scaling
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-gray-500 w-8 text-right font-medium">{month}</span>
      <div className="flex-1 flex gap-1">
        {values.map((v: number, i: number) => (
          <div key={i} className="flex-1 group relative">
            <div className="h-5 bg-gray-50 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ 
                  width: `${(v / maxValue) * 100}%`, 
                  backgroundColor: i === 0 ? 'rgb(13, 148, 136)' : i === 1 ? 'rgb(124, 58, 237)' : 'rgb(5, 150, 105)' 
                }}
              />
            </div>
            <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap z-10">
              {v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendItem({ color, label }: any) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-gray-600">{label}</span>
    </div>
  );
}

function StatusItem({ initial, name, pupils, status, color, statusColor = "bg-emerald-100 text-emerald-700" }: any) {
  return (
    <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: color }}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">{name}</p>
        <p className="text-[10px] text-gray-500">{pupils} pupils</p>
      </div>
      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${statusColor}`}>
        {status}
      </span>
    </button>
  );
}

function SchoolTableRow({ initial, name, city, type, enrollment, staff, revenue, collection, capacity, plan, color }: any) {
  const capColor = capacity > 80 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: color }}>
            {initial}
          </div>
          <div>
            <p className="font-medium text-gray-800">{name}</p>
            <p className="text-[10px] text-gray-500">{city}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">{type}</span>
      </td>
      <td className="px-4 py-3 text-right font-semibold text-gray-800">{enrollment}</td>
      <td className="px-4 py-3 text-right text-gray-600">{staff}</td>
      <td className="px-4 py-3 text-right font-semibold text-gray-800">{revenue}</td>
      <td className="px-4 py-3 text-right">
        <span className={`font-medium ${parseFloat(collection) < 80 ? 'text-red-600' : 'text-green-600'}`}>{collection}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${capColor}`} style={{ width: `${capacity}%` }} />
          </div>
          <span className="text-[10px] text-gray-500">{capacity}%</span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
          plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' : 
          plan === 'Ultimate' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {plan}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <button className="p-1.5 rounded-lg hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-colors">
          <Eye className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}

function RevenueProgress({ initial, name, amount, percent, color }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0" style={{ backgroundColor: color }}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-gray-700 truncate">{name}</span>
          <span className="text-[10px] font-semibold text-gray-800">{amount}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500" 
            style={{ width: `${percent}%`, backgroundColor: color }} 
          />
        </div>
      </div>
      <span className="text-[10px] text-gray-500 w-10 text-right">{percent}%</span>
    </div>
  );
}

function AlertItem({ icon, title, desc, color, titleColor, descColor }: any) {
  return (
    <div className={`flex items-start gap-2.5 p-3 ${color} rounded-lg transition-transform hover:scale-[1.01] cursor-pointer`}>
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className={`text-xs font-medium ${titleColor}`}>{title}</p>
        <p className={`text-[10px] ${descColor} mt-0.5`}>{desc}</p>
      </div>
    </div>
  );
}
