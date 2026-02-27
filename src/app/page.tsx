'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Mail, Lock, Eye, EyeOff, X, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SigninPage() {
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Welcome back!",
          description: "Signing you into your dashboard...",
        });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Account created!",
          description: "Welcome to the EduCare360 platform.",
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
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-6 selection:bg-teal-500/30">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        {/* Header Section with Brand Gradient */}
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#0D9488] p-6 text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="h-24 w-24" />
          </div>
          
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <span className="text-white font-bold text-lg font-headline">E</span>
            </div>
            <div>
              <h2 className="text-lg font-bold font-headline">EduCare360</h2>
              <p className="text-xs text-white/70">Unified School Management</p>
            </div>
          </div>
          <p className="text-sm text-white/80 relative z-10">
            {mode === 'signin' ? 'Sign in to access your dashboard' : 'Create your institution account'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200">
          <button 
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-3 text-xs font-semibold transition-all ${
              mode === 'signin' 
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 text-xs font-semibold transition-all ${
              mode === 'signup' 
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
              <input 
                type="email" 
                placeholder="admin@sunrise.edu" 
                required 
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required 
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === 'signin' && (
            <div className="flex justify-end">
              <button type="button" className="text-[11px] font-semibold text-teal-600 hover:underline">
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#1E3A5F] to-[#0D9488] text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>

          <div className="pt-2">
            <p className="text-center text-[11px] text-gray-400 italic">
              Demo: Sign up with any email to explore role-based access.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
