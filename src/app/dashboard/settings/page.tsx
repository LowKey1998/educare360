
"use client"

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  Calendar, 
  Bell, 
  Shield, 
  Save, 
  Loader2,
  Globe,
  Mail,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDatabase, useRTDBDoc } from '@/firebase';
import { ref, set, serverTimestamp } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

export default function SystemSettingsPage() {
  const database = useDatabase();
  const { toast } = useToast();
  const { data: schoolSettings, loading } = useRTDBDoc(database, 'system_settings');
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    shortName: '',
    currentTerm: 'Term 1',
    currentYear: '2026',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (schoolSettings) {
      setFormData({
        schoolName: schoolSettings.schoolName || '',
        shortName: schoolSettings.shortName || '',
        currentTerm: schoolSettings.currentTerm || 'Term 1',
        currentYear: schoolSettings.currentYear || '2026',
        email: schoolSettings.email || '',
        phone: schoolSettings.phone || '',
        address: schoolSettings.address || ''
      });
    }
  }, [schoolSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await set(ref(database, 'system_settings'), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Settings Saved", description: "Institutional configuration updated successfully." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        <p className="text-sm text-gray-500 italic">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Settings className="h-6 w-6 text-teal-600" />
            System Administration
          </h1>
          <p className="text-sm text-gray-500">Configure global institutional settings and platform behavior.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="institution" className="w-full">
        <TabsList className="bg-white border border-gray-100 p-1 rounded-xl shadow-sm h-auto gap-1 mb-6">
          <TabsTrigger value="institution" className="px-4 py-2 text-xs rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Institution Profile</TabsTrigger>
          <TabsTrigger value="academic" className="px-4 py-2 text-xs rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Academic Sessions</TabsTrigger>
          <TabsTrigger value="notifications" className="px-4 py-2 text-xs rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="px-4 py-2 text-xs rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Security & RBAC</TabsTrigger>
        </TabsList>

        <TabsContent value="institution" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm">Institutional Identity</CardTitle>
                <CardDescription className="text-xs">This information appears on documents, invoices, and reports.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-gray-400">SCHOOL FULL NAME</Label>
                    <Input 
                      placeholder="e.g. Sunrise Academy" 
                      value={formData.schoolName}
                      onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-gray-400">SHORT NAME / CODE</Label>
                    <Input 
                      placeholder="e.g. SA" 
                      value={formData.shortName}
                      onChange={(e) => setFormData({...formData, shortName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400">INSTITUTIONAL EMAIL</Label>
                  <Input 
                    type="email" 
                    placeholder="admin@school.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400">OFFICE PHONE</Label>
                  <Input 
                    placeholder="+263 7..." 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400">PHYSICAL ADDRESS</Label>
                  <Input 
                    placeholder="Main Block, Education St." 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm bg-gray-50/50">
              <CardHeader>
                <CardTitle className="text-sm">Identity Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white text-3xl font-bold">
                  {formData.shortName?.[0] || 'E'}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{formData.schoolName || 'Institution Name'}</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{formData.shortName || 'CODE'}</p>
                </div>
                <div className="w-full pt-4 border-t border-gray-200 text-left space-y-2">
                  <p className="text-[10px] text-gray-500 flex items-center gap-2"><Mail className="h-3 w-3" /> {formData.email || 'not set'}</p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-2"><Phone className="h-3 w-3" /> {formData.phone || 'not set'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Session Management</CardTitle>
              <CardDescription className="text-xs">Define the active term and academic year for all records.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-gray-400">ACTIVE ACADEMIC YEAR</Label>
                    <Input 
                      placeholder="2026" 
                      value={formData.currentYear}
                      onChange={(e) => setFormData({...formData, currentYear: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-gray-400">CURRENT TERM</Label>
                    <select 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={formData.currentTerm}
                      onChange={(e) => setFormData({...formData, currentTerm: e.target.value})}
                    >
                      <option>Term 1</option>
                      <option>Term 2</option>
                      <option>Term 3</option>
                    </select>
                  </div>
                </div>
                <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-teal-800">Operational Update</p>
                    <p className="text-[10px] text-teal-700 mt-1 leading-relaxed">
                      Changing these settings will update all dashboards, report card headers, and attendance registers across the entire institution instantly.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="p-12 text-center text-gray-400 italic text-xs">
          Notification templates and SMS gateway configuration...
        </TabsContent>

        <TabsContent value="security" className="p-12 text-center text-gray-400 italic text-xs">
          Password policies and custom role definitions...
        </TabsContent>
      </Tabs>
    </div>
  );
}
