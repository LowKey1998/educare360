
"use client"

import { useState, useMemo } from 'react';
import { 
  Shield, 
  Search, 
  UserCircle, 
  MoreVertical, 
  Trash2, 
  Loader2,
  Lock,
  Mail,
  Calendar
} from 'lucide-react';
import { useDatabase, useRTDBCollection } from '@/firebase';
import { ref, remove } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

export default function UsersRBACPage() {
  const [search, setSearch] = useState('');
  const database = useDatabase();
  const { toast } = useToast();
  const { data: users, loading } = useRTDBCollection(database, 'users');

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to remove this user from the platform?')) return;
    try {
      await remove(ref(database, `users/${uid}`));
      toast({ title: "User Removed", description: "The platform access for this user has been revoked." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to remove user account.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-4 top-4 opacity-10">
          <Shield className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Users & Role Based Access</h2>
            <p className="text-sm text-white/80 mt-1">Manage institutional access control and user registrations.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users by name, email or role..." 
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-xs text-gray-400 italic">Syncing user directory...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Platform Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Registered On</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <UserCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{user.displayName || 'No Name'}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <Mail className="w-2.5 h-2.5" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        user.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                        user.role === 'staff' ? 'bg-teal-50 text-teal-600 border-teal-100' : 
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-300" />
                        {new Date(user.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteUser(user.id)} className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
            <p className="text-sm text-gray-400 italic">No users matching your search criteria were found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
