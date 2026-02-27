"use client"

import { useAuth } from '@/hooks/use-auth';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar';
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
  Layers,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4">E</div>
          <p className="text-white/60">Loading EduCare360...</p>
        </div>
      </div>
    );
  }

  const navGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      ]
    },
    {
      label: 'PLATFORM',
      items: [
        { title: 'Multi-School Mgmt', icon: Layers, href: '/dashboard/multi-school' },
        { title: 'Users & RBAC', icon: ShieldCheck, href: '/dashboard/users' },
      ]
    },
    {
      label: 'PEOPLE',
      items: [
        { title: 'Admissions', icon: UserPlus, href: '/dashboard/admissions', badge: '12' },
        { title: 'Pupil Management', icon: Users, href: '/dashboard/students' },
        { title: 'Parent Portal', icon: MessageSquare, href: '/dashboard/communication' },
        { title: 'HR & Staff', icon: Briefcase, href: '/dashboard/hr' },
      ]
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
        <Sidebar variant="sidebar" className="border-r border-white/5 bg-[#0f172a] text-white">
          <SidebarHeader className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">
                E
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-white">EduCare360</span>
                <span className="text-xs text-white/50">Sunrise Academy</span>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white/80">Sunrise Academy</span>
                    <span className="text-[10px] text-white/40">Main Campus - Harare</span>
                  </div>
                </div>
                <ChevronDown className="h-3 w-3 text-white/40" />
              </button>

              <div className="flex gap-2">
                <Badge variant="outline" className="bg-[#1e293b] border-white/10 text-primary text-[10px] px-2 py-0">2026</Badge>
                <Badge variant="outline" className="bg-[#1e293b] border-white/10 text-primary text-[10px] px-2 py-0">Term 1</Badge>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                <Input 
                  placeholder="Search modules..." 
                  className="pl-9 h-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs focus:ring-primary"
                />
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4">
            {navGroups.map((group) => (
              <SidebarGroup key={group.label} className="mb-4">
                <SidebarGroupLabel className="text-[10px] font-bold text-white/30 tracking-widest mb-2 px-2">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={pathname === item.href}
                          className={`w-full group/btn ${pathname === item.href ? 'bg-primary/20 text-primary' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                        >
                          <Link href={item.href} className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <item.icon className={`h-4 w-4 ${pathname === item.href ? 'text-primary' : 'text-white/40 group-hover/btn:text-white/70'}`} />
                              <span className="text-sm font-medium">{item.title}</span>
                            </div>
                            {item.badge && (
                              <span className="bg-[#f43f5e] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-white/5">
            <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-primary hover:bg-primary/10 hover:text-primary px-3 rounded-lg transition-all">
              <LogIn className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-tight">Sign In to EduCare360</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="flex flex-col">
                <h1 className="text-base font-bold text-gray-900 leading-tight">Dashboard</h1>
                <p className="text-xs text-gray-400 font-medium tracking-tight">Sunrise Academy - Main Campus</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900 h-9 w-9">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900 h-9 w-9">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900 h-9 w-9">
                  <Bell className="h-4 w-4" />
                </Button>
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-[#f43f5e] text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-white">4</span>
              </div>
              <Button className="ml-2 gap-2 h-9 bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-4 rounded-lg">
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-[#f8fafc] custom-scrollbar">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
