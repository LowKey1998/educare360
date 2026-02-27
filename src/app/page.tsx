
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set, serverTimestamp, onValue } from 'firebase/database';
import { useAuth, useUser, useDatabase } from '@/firebase';
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SigninPage() {
  const auth = useAuth();
  const database = useDatabase();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'staff' | 'parent'>('parent');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Check if an admin exists to allow/restrict admin signup
  useEffect(() => {
    if (!database) return;
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setAdminExists(false);
        setRole('admin'); 
        return;
      }
      const hasAdmin = Object.values(data).some((u: any) => u.role === 'admin');
      setAdminExists(hasAdmin);
      
      // Enforce roles: If admin exists, publics can only be parents.
      // If no admin exists, first user MUST be admin.
      if (hasAdmin) {
        setRole('parent');
      } else {
        setRole('admin');
      }
    });
    return () => unsubscribe();
  }, [database]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === 'signup' && !name) {
      toast({
        title: "Name Required",
        description: "Please enter your full name to create an account.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Welcome back!",
          description: "Signing you into your dashboard...",
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        // Create user profile in RTDB
        await set(ref(database, `users/${newUser.uid}`), {
          email: newUser.email,
          role: role,
          createdAt: serverTimestamp(),
          displayName: name
        });

        toast({
          title: "Account created!",
          description: `Welcome to EduCare360, ${name}. Registered as a ${role}.`,
        });
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: mode === 'signin' ? "Authentication Failed" : "Registration Failed",
        description: error.message || "Something went wrong. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (adminExists === null && database)) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
          <p className="text-sm text-gray-500 font-medium">Initializing EduCare360...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-6 selection:bg-teal-500/30">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#0D9488] p-8 text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="h-32 w-32" />
          </div>
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-lg">
              <span className="text-white font-bold text-xl font-headline">E</span>
            </div>
            <div>
              <h2 className="text-xl font-bold font-headline tracking-tight">EduCare360</h2>
              <p className="text-xs text-white/70">Unified School Management</p>
            </div>
          </div>
          <p className="text-sm text-white/80 relative z-10 leading-relaxed">
            {mode === 'signin' 
              ? 'Enter your credentials to access the institution dashboard.' 
              : 'Register your new account to begin using the platform.'}
          </p>
        </div>

        <div className="flex border-b border-gray-100">
          <button 
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
              mode === 'signin' 
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/10' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
              mode === 'signup' 
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/10' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    required 
                    className="w-full bg-white pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-gray-300"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Role</label>
                <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-700 uppercase">{role}</span>
                    <span className="text-[9px] text-teal-600/70 font-medium">Auto-assigned</span>
                  </div>
                  <p className="text-[10px] text-teal-600 mt-1">
                    {role === 'admin' 
                      ? 'No administrator found. You are registering as the system owner.' 
                      : 'Registering as a Parent to track student progress.'}
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
              <input 
                type="email" 
                placeholder="email@example.com" 
                required 
                className="w-full bg-white pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required 
                minLength={6}
                className="w-full bg-white pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#1E3A5F] to-[#0D9488] text-white text-sm font-bold rounded-xl hover:shadow-xl hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              mode === 'signin' ? 'Access Dashboard' : 'Register Account'
            )}
          </button>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-center text-[10px] text-gray-400 italic leading-relaxed">
              {mode === 'signup' && adminExists 
                ? 'Staff and Admin accounts must be created by an existing administrator.' 
                : 'Powered by Firebase Realtime DB. Roles determine institutional access.'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
