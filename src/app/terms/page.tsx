
'use client';

import { useDatabase, useRTDBDoc } from '@/firebase';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  const database = useDatabase();
  const { data: schoolSettings } = useRTDBDoc(database, 'system_settings');
  const schoolName = schoolSettings?.schoolName || 'EduCare360';
  const primaryColor = schoolSettings?.primaryColor || '#0D9488';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-teal-600 transition-colors uppercase tracking-widest mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Terms & Conditions</h1>
                <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">{schoolName} Institutional Policy</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Last Updated: {new Date(schoolSettings?.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="p-8 md:p-12 prose prose-sm max-w-none prose-teal">
            {schoolSettings?.termsAndConditions ? (
              <div className="whitespace-pre-wrap text-gray-600 leading-relaxed">
                {schoolSettings.termsAndConditions}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <FileText className="h-12 w-12 text-gray-200 mx-auto" />
                <p className="text-gray-400 italic">The Terms & Conditions for {schoolName} have not been published yet. Please check back later or contact the administration office.</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-8 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 font-medium">
              &copy; {new Date().getFullYear()} {schoolName} Unified. For legal inquiries, please contact <a href={`mailto:${schoolSettings?.email}`} className="text-teal-600 hover:underline">{schoolSettings?.email}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
