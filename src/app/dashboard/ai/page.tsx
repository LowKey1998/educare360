
"use client"

import { useState } from 'react';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  TriangleAlert, 
  FileText, 
  ChartColumn, 
  MessageSquare, 
  Zap, 
  Target, 
  Sparkles, 
  Shield,
  ArrowRight
} from 'lucide-react';

const AI_METRICS = [
  { label: 'Predictions', value: '1,247', icon: TrendingUp, gradient: 'from-violet-500 to-purple-500' },
  { label: 'Active Rules', value: '7', icon: Zap, gradient: 'from-amber-500 to-orange-500' },
  { label: 'Comments', value: '3,890', icon: FileText, gradient: 'from-teal-500 to-emerald-500' },
  { label: 'Risk Alerts', value: '156', icon: TriangleAlert, gradient: 'from-red-500 to-rose-500' },
  { label: 'AI Queries', value: '2,340', icon: MessageSquare, gradient: 'from-indigo-500 to-blue-500' },
  { label: 'Accuracy', value: '94.2%', icon: Target, gradient: 'from-green-500 to-emerald-500' },
];

const AI_TOOLS = [
  {
    title: 'Performance Prediction',
    desc: 'AI analyzes attendance, grades, and behaviour patterns to predict academic outcomes for each pupil.',
    metric: '1,247 predictions generated',
    icon: TrendingUp,
    color: 'from-violet-500 to-purple-600',
    border: 'hover:border-purple-200'
  },
  {
    title: 'Fee Default Risk Alerts',
    desc: 'Identify pupils at risk of fee defaults before they happen. Get proactive intervention recommendations.',
    metric: '156 risk alerts triggered',
    icon: TriangleAlert,
    color: 'from-red-500 to-orange-500',
    border: 'hover:border-red-200'
  },
  {
    title: 'Auto Report Comments',
    desc: 'Generate personalized, professional report card comments for each pupil using AI analysis.',
    metric: '3,890 comments generated',
    icon: FileText,
    color: 'from-teal-500 to-emerald-500',
    border: 'hover:border-teal-200'
  },
  {
    title: 'Enrolment Forecasting',
    desc: 'Predict future enrollment trends based on historical data. Plan capacity and resources ahead.',
    metric: '94.2% forecast accuracy',
    icon: ChartColumn,
    color: 'from-blue-500 to-indigo-600',
    border: 'hover:border-blue-200'
  },
  {
    title: 'AI Assistant',
    desc: 'Chat with EduCare AI for instant answers about school management, policies, and best practices.',
    metric: '2,340 queries answered',
    icon: Brain,
    color: 'from-indigo-500 to-purple-600',
    border: 'hover:border-indigo-200'
  },
  {
    title: 'Automation Rules',
    desc: 'Set up automated workflows for attendance alerts, fee reminders, grade notifications, and more.',
    metric: '7 active automation rules',
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
    border: 'hover:border-amber-200'
  }
];

const RECENT_ACTIVITY = [
  { title: 'Performance prediction generated', sub: 'Tendai Moyo - Grade 2A', time: '2 min ago', color: 'bg-violet-500' },
  { title: 'Automation rule triggered', sub: 'Low Attendance Alert - 3 pupils notified', time: '15 min ago', color: 'bg-amber-500' },
  { title: 'Report comments generated', sub: 'Batch: Grade 5A - 28 pupils', time: '1 hr ago', color: 'bg-teal-500' },
  { title: 'Fee risk analysis completed', sub: '4 high-risk pupils identified', time: '2 hrs ago', color: 'bg-red-500' },
  { title: 'AI Assistant query', sub: '"How to improve Grade 3 math scores"', time: '3 hrs ago', color: 'bg-indigo-500' },
  { title: 'Enrollment forecast updated', sub: 'Next term: 492 pupils predicted', time: '5 hrs ago', color: 'bg-blue-500' },
  { title: 'Automation rule created', sub: 'Birthday Greeting - enabled', time: '1 day ago', color: 'bg-amber-500' },
  { title: 'Batch predictions completed', sub: 'Grade 7 - 45 pupils analyzed', time: '1 day ago', color: 'bg-violet-500' },
];

export default function AIAutomationPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="350" cy="50" r="120" fill="white" />
            <circle cx="50" cy="180" r="80" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI & Automation</h2>
            <p className="text-sm text-white/80 mt-1">Intelligent insights, automated workflows, and AI-powered tools for smarter school management</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/15 rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur-md">
              <Activity className="w-3 h-3" /> AI Engine Active
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-100 p-1.5 shadow-sm">
        <div className="flex gap-1 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> Overview
          </button>
          {['Performance Prediction', 'Fee Risk Alerts', 'Report Comments', 'Enrolment Forecast', 'AI Assistant', 'Automation Rules'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.toLowerCase() ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {AI_METRICS.map((metric) => (
            <div key={metric.label} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${metric.gradient} flex items-center justify-center text-white mb-2 shadow-sm`}>
                <metric.icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-gray-800">{metric.value}</p>
              <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wider">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_TOOLS.map((tool) => (
            <div key={tool.title} className={`bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg ${tool.border} transition-all cursor-pointer group relative overflow-hidden`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                <tool.icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-gray-800 mb-1.5">{tool.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{tool.desc}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">{tool.metric}</span>
                <span className="text-xs text-purple-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Open <Sparkles className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Activity & Privacy Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent AI Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-purple-500" /> Recent AI Activity
            </h4>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className={`w-2 h-2 rounded-full ${activity.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 group-hover:text-purple-600 transition-colors">{activity.title}</p>
                    <p className="text-[10px] text-gray-500 truncate">{activity.sub}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-[11px] font-bold text-purple-600 border border-purple-100 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-1">
              View Full Audit Log <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Privacy & Security Card */}
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-6 shadow-sm flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">AI Privacy & Security</h4>
                  <p className="text-[10px] text-gray-500">Secure institutional processing</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-100/50">
                  <p className="text-xs font-bold text-gray-700 mb-1">Data Privacy</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">All AI processing is done server-side. No pupil data leaves our secure infrastructure or is used for training public models.</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-100/50">
                  <p className="text-xs font-bold text-gray-700 mb-1">Transparent AI</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">Every AI decision includes confidence scores and context-aware explanations for full transparency.</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-100/50">
                  <p className="text-xs font-bold text-gray-700 mb-1">Human Oversight</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">AI suggestions are recommendations only. All final academic or financial decisions require human approval.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
