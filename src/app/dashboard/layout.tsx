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
  SidebarFooter
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CalendarCheck, 
  MessageSquare, 
  Settings, 
  LogOut, 
  GraduationCap,
  ShieldCheck,
  UserCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <GraduationCap className="h-12 w-12 text-primary mb-4" />
          <p className="text-muted-foreground">Initializing EduCare360...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { title: 'Overview', icon: LayoutDashboard, href: '/dashboard', roles: ['admin', 'teacher', 'parent'] },
    { title: 'Admissions', icon: FileText, href: '/dashboard/admissions', roles: ['admin'] },
    { title: 'Students', icon: Users, href: '/dashboard/students', roles: ['admin', 'teacher'] },
    { title: 'Attendance', icon: CalendarCheck, href: '/dashboard/attendance', roles: ['admin', 'teacher', 'parent'] },
    { title: 'Communication', icon: MessageSquare, href: '/dashboard/communication', roles: ['admin', 'teacher'] },
    { title: 'Settings', icon: Settings, href: '/dashboard/settings', roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border/50">
          <SidebarHeader className="p-4">
            <Link href="/" className="flex items-center gap-2 px-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg font-headline tracking-tight group-data-[collapsible=icon]:hidden">
                EduCare<span className="text-primary">360</span>
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarMenu>
              {filteredNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={`${item.href}?role=${user?.role}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <Separator className="mb-4 opacity-50" />
            <div className="flex items-center gap-3 px-2 py-2 mb-2 group-data-[collapsible=icon]:hidden">
              <div className="bg-secondary p-2 rounded-full">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
              </div>
            </div>
            <SidebarMenuButton className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/30 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Portal</span>
                <span className="text-sm text-muted-foreground">/</span>
                <span className="text-sm font-semibold capitalize">{pathname.split('/').pop() || 'Overview'}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider">{user?.role} Access</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}