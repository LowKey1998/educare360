
'use client';

import { useRouter } from 'next/navigation';
import { useUser, useDatabase, useRTDBDoc } from '@/firebase';
import { 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Globe,
  Sparkles,
  Heart,
  CheckCircle2,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const { user, loading: authLoading } = useUser();
  const database = useDatabase();
  const router = useRouter();
  
  const { data: schoolSettings } = useRTDBDoc(database, 'system_settings');
  const schoolName = schoolSettings?.schoolName || 'EduCare360';
  const primaryColor = schoolSettings?.primaryColor || '#0D9488';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-teal-500 rounded-xl mb-4"></div>
          <p className="text-gray-400 text-sm font-medium">Loading {schoolName}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-teal-100 selection:text-teal-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: primaryColor }}>
              {schoolSettings?.logoUrl ? (
                <img src={schoolSettings.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span>{(schoolSettings?.shortName || 'E')[0]}</span>
              )}
            </div>
            <span className="font-bold text-gray-900 tracking-tight">{schoolName}</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild style={{ backgroundColor: primaryColor }} className="rounded-full px-6 shadow-lg shadow-teal-600/20">
                <Link href="/dashboard">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors">Sign In</Link>
                <Button asChild style={{ backgroundColor: primaryColor }} className="rounded-full px-6 shadow-lg shadow-teal-600/20">
                  <Link href="/login">Apply Now</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-[10px] font-bold text-teal-700 uppercase tracking-widest">
                <Sparkles className="h-3 w-3" /> Unified Institutional Excellence
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                Empowering the next generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Global Leaders.</span>
              </h1>
              <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
                {schoolSettings?.motto || 'Streamlined school administration, real-time family engagement, and data-driven academic growth—all in one secure platform.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild style={{ backgroundColor: primaryColor }} className="h-14 px-8 rounded-2xl text-base font-bold shadow-xl shadow-teal-600/20 hover:scale-[1.02] transition-transform">
                  <Link href="/login">Explore Portals <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl text-base font-bold border-gray-200 hover:bg-gray-50 transition-all">
                  Watch Virtual Tour
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="user" />
                    </div>
                  ))}
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Trusted by <span className="text-gray-900 font-bold">2,500+</span> Students & Parents
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group">
                <img 
                  src="https://picsum.photos/seed/school1/1200/800" 
                  alt="School" 
                  className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700" 
                  data-ai-hint="modern school"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <p className="font-bold text-sm uppercase tracking-wider">Accredited Excellence</p>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">Providing high-standard educational resources and a secure environment for every student to thrive.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-sm font-bold text-teal-600 uppercase tracking-[0.2em]">Institutional Gateways</h2>
            <h3 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">Access your personalized dashboard.</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Select the portal relevant to your role to access real-time data, academic reports, and communication tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PortalCard 
              title="Parent Portal" 
              desc="Track your child's academic progress, attendance records, and pay school fees securely online."
              icon={<Heart className="h-6 w-6 text-rose-600" />}
              color="bg-rose-50"
              href="/login"
              role="Parent Access"
            />
            <PortalCard 
              title="Staff Registry" 
              desc="Manage lesson plans, classroom activities, and student assessments with integrated AI assistance."
              icon={<ShieldCheck className="h-6 w-6 text-teal-600" />}
              color="bg-teal-50"
              href="/login"
              role="Teacher Login"
            />
            <PortalCard 
              title="Institutional Admin" 
              desc="Global oversight of finances, multi-school management, and platform configuration."
              icon={<Lock className="h-6 w-6 text-indigo-600" />}
              color="bg-indigo-50"
              href="/login"
              role="System Admin"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatItem label="Active Students" value="1,200+" />
            <StatItem label="Certified Staff" value="85+" />
            <StatItem label="Accuracy Rate" value="99.9%" />
            <StatItem label="Global Ranking" value="Top 10" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-rose-500"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold">
                  {(schoolSettings?.shortName || 'E')[0]}
                </div>
                <span className="font-bold text-xl tracking-tight">{schoolName}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Transforming the educational landscape through integrated technology and data-driven insights.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Institution</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Academic Calendar</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Admissions</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Parent Guide</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Stay Updated</h4>
              <p className="text-sm text-gray-400">Subscribe to our newsletter for institutional updates.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="email@example.com" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm flex-1 outline-none focus:border-teal-500" />
                <Button style={{ backgroundColor: primaryColor }} className="rounded-xl px-4">Join</Button>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
            <p>&copy; {new Date().getFullYear()} {schoolName} Unified. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-white transition-colors">Facebook</Link>
              <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PortalCard({ title, desc, icon, color, href, role }: any) {
  return (
    <Link href={href} className="group">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{role}</p>
        <h4 className="text-xl font-bold text-gray-900 mb-3">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
        <div className="mt-6 flex items-center text-sm font-bold text-gray-900 group-hover:gap-2 transition-all">
          Access Portal <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}

function StatItem({ label, value }: any) {
  return (
    <div className="text-center space-y-1">
      <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}
