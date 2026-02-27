
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';
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
  const [role, setRole] = useState<'admin' | 'staff' | 'parent'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
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
          displayName: email.split('@')[0]
        });

        toast({
          title: "Account created!",
          description: `Welcome to EduCare360 as a ${role}.`,
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

  if (authLoading) {
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
              : 'Register your new institution account to begin onboarding.'}
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
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assign Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['admin', 'staff', 'parent'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-1 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                      role === r 
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm' 
                        : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
              <input 
                type="email" 
                placeholder="admin@sunrise.edu" 
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

          <div className="pt-4 border-t border-gray-50">
            <p className="text-center text-[10px] text-gray-400 italic leading-relaxed">
              Powered by Firebase Realtime DB. Roles determine institutional access.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
