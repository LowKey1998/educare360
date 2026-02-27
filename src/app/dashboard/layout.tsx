"use client"

import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Search,
  HelpCircle,
  Bell,
  LogIn,
  ChevronDown,
  Building2,
  UserPlus,
  Briefcase,
  ShieldCheck,
  Heart,
  Baby,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Calendar,
  DollarSign,
  Bus,
  UtensilsCrossed,
  Stethoscope,
  Package,
  ChartColumn,
  FileText,
  Brain,
  Globe,
  Menu,
  ChevronsUpDown,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1A2E] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-teal-500/20">E</div>
          <p className="text-white/60 font-medium">Loading EduCare360...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navGroups = [
    {
      label: 'OVERVIEW',
      color: 'text-teal-400',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      ]
    },
    {
      label: 'PLATFORM',
      color: 'text-blue-400',
      items: [
        { title: 'Multi-School Mgmt', icon: Building2, href: '/dashboard/multi-school' },
        { title: 'Users & RBAC', icon: ShieldCheck, href: '/dashboard/users' },
      ]
    },
    {
      label: 'PEOPLE',
      color: 'text-purple-400',
      items: [
        { title: 'Admissions', icon: UserPlus, href: '/dashboard/admissions', badge: '12' },
        { title: 'Pupil Management', icon: Users, href: '/dashboard/students' },
        { title: 'Parent Portal', icon: Heart, href: '/dashboard/parent-portal' },
        { title: 'HR & Staff', icon: Briefcase, href: '/dashboard/hr' },
      ]
    },
    {
      label: 'ACADEMIC',
      color: 'text-amber-400',
      items: [
        { title: 'ECD Development', icon: Baby, href: '/dashboard/ecd' },
        { title: 'Academic Mgmt', icon: GraduationCap, href: '/dashboard/academic' },
        { title: 'Classroom Mgmt', icon: BookOpen, href: '/dashboard/classroom' },
        { title: 'Attendance', icon: ClipboardCheck, href: '/dashboard/attendance' },
        { title: 'Timetable & Calendar', icon: Calendar, href: '/dashboard/calendar' },
      ]
    },
    {
      label: 'OPERATIONS',
      color: 'text-green-400',
      items: [
        { title: 'Finance & Billing', icon: DollarSign, href: '/dashboard/finance', badge: '5' },
        { title: 'Transport', icon: Bus, href: '/dashboard/transport' },
        { title: 'Meals & Catering', icon: UtensilsCrossed, href: '/dashboard/catering' },
        { title: 'Health & Safety', icon: Stethoscope, href: '/dashboard/health' },
        { title: 'Inventory & Assets', icon: Package, href: '/dashboard/inventory' },
      ]
    },
    {
      label: 'INTELLIGENCE',
      color: 'text-rose-400',
      items: [
        { title: 'Communication', icon: MessageSquare, href: '/dashboard/communication', badge: '8' },
        { title: 'Analytics & Reports', icon: ChartColumn, href: '/dashboard/analytics' },
        { title: 'Document Builder', icon: FileText, href: '/dashboard/documents' },
        { title: 'AI & Automation', icon: Brain, href: '/dashboard/ai' },
      ]
    },
    {
      label: 'SYSTEM',
      color: 'text-gray-400',
      items: [
        { title: 'Integrations', icon: Globe, href: '/dashboard/integrations' },
        { title: 'System Admin', icon: Settings, href: '/dashboard/settings' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed left-0 top-0 z-50 h-full w-64 bg-[#0F1A2E] flex flex-col border-r border-[#1E3A5F]/50 transition-transform duration-300 md:relative md:translate-x-0`}
      >
        <div className="p-4 border-b border-[#1E3A5F]/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-semibold text-sm truncate">EduCare360</h2>
              <p className="text-gray-500 text-xs truncate">Sunrise Academy</p>
            </div>
          </div>

          <div className="mt-3 relative">
            <button className="w-full flex items-center gap-2 px-2.5 py-2 bg-[#1A2742] rounded-lg border border-[#1E3A5F]/50 hover:border-teal-500/30 transition-colors group">
              <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0 bg-teal-600">
                SA
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[10px] text-gray-400 truncate">Sunrise Academy</p>
                <p className="text-[9px] text-gray-600 truncate">Main Campus - Harare</p>
              </div>
              <ChevronsUpDown className="h-3 w-3 text-gray-500 group-hover:text-gray-400 flex-shrink-0" />
            </button>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 font-medium text-[10px]">2026</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium text-[10px]">Term 1</span>
          </div>
        </div>

        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <Input 
              placeholder="Search modules..." 
              className="w-full bg-[#1A2742] text-gray-300 text-xs rounded-lg pl-8 py-2 border border-[#1E3A5F]/50 focus:border-teal-500/50 focus:ring-0 placeholder:text-gray-600 h-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-1">
              <button className="w-full flex items-center justify-between px-2 py-2 text-[10px] font-semibold tracking-wider hover:bg-white/5 rounded-lg transition-colors">
                <span className={group.color}>{group.label}</span>
                <ChevronDown className="h-3 w-3 text-gray-600" />
              </button>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.title} 
                      href={item.href}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all duration-200 group ${
                        isActive 
                          ? 'bg-gradient-to-r from-teal-500/20 to-transparent text-teal-400 border-l-2 border-teal-400' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      <item.icon className={`h-4.5 w-4.5 ${isActive ? 'text-teal-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
                      <span className="truncate flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[10px] font-medium">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[#1E3A5F]/50">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-600/30 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-gray-800">Dashboard</h1>
              <p className="text-[10px] text-gray-400">Sunrise Academy - Main Campus</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <Search className="h-4.5 w-4.5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors hidden md:flex">
              <HelpCircle className="h-4.5 w-4.5" />
            </button>
            <div className="relative">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors relative">
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-medium border border-white">4</span>
              </button>
            </div>
            <div className="flex items-center gap-2 ml-4 border-l border-gray-100 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-gray-800 leading-none">{user?.email?.split('@')[0]}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Admin Staff</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSignOut}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar bg-[#F8F9FC]">
          {children}
        </main>
      </div>
    </div>
  );
}
