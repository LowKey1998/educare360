"use client"

import { Shield } from 'lucide-react';

export default function UsersRBACPage() {
  const features = [
    "User Management",
    "Role Creation",
    "Permission Matrix",
    "Staff Login Accounts",
    "Parent Portal Accounts",
    "Audit Logs",
    "Session Control"
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10">
          <svg viewBox="0 0 200 200" className="w-32 h-32">
            <circle cx="100" cy="100" r="80" fill="white"></circle>
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Users & Access Control (RBAC)</h2>
            <p className="text-sm text-white/80 mt-1">Manage users, roles, permissions, and access control across the platform.</p>
          </div>
        </div>
      </div>

      {/* Module Features */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Module Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
              <div className="w-2 h-2 rounded-full bg-teal-500 group-hover:scale-125 transition-transform"></div>
              <span className="text-xs text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 text-center border border-gray-200/50">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <Shield className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-gray-800">Full Module Coming Soon</h3>
        <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
          This module is part of the EduCare360 Enterprise suite. All features listed above are planned for implementation as part of the complete platform rollout.
        </p>
        <div className="flex gap-2 justify-center mt-6">
          <button className="px-4 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
            Request Early Access
          </button>
          <button className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            View Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}
