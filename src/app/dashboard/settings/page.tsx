
"use client"

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Loader2,
  Mail,
  Phone,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  Palette,
  Quote,
  DollarSign,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useDatabase, useRTDBDoc } from '@/firebase';
import { ref, set, serverTimestamp } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

const PRESET_COLORS = [
  { name: 'Teal (Default)', value: '#0D9488' },
  { name: 'Ocean Blue', value: '#1E40AF' },
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Crimson', value: '#991B1B' },
  { name: 'Emerald', value: '#065F46' },
  { name: 'Purple', value: '#6D28D9' },
  { name: 'Amber', value: '#B45309' },
  { name: 'Slate', value: '#1E293B' },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'ZWL', symbol: 'Z$', name: 'Zimbabwean Dollar' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
];

export default function SystemSettingsPage() {
  const database = useDatabase();
  const { toast } = useToast();
  const { data: schoolSettings, loading } = useRTDBDoc(database, 'system_settings');
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    shortName: '',
    motto: '',
    currentTerm: 'Term 1',
    currentYear: '2026',
    email: '',
    phone: '',
    address: '',
    logoUrl: '',
    primaryColor: '#0D9488',
    currency: 'USD',
    currencySymbol: '$',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    privacyPolicy: '',
    termsAndConditions: ''
  });

  useEffect(() => {
    if (schoolSettings) {
      setFormData({
        schoolName: schoolSettings.schoolName || '',
        shortName: schoolSettings.shortName || '',
        motto: schoolSettings.motto || '',
        currentTerm: schoolSettings.currentTerm || 'Term 1',
        currentYear: schoolSettings.currentYear || '2026',
        email: schoolSettings.email || '',
        phone: schoolSettings.phone || '',
        address: schoolSettings.address || '',
        logoUrl: schoolSettings.logoUrl || '',
        primaryColor: schoolSettings.primaryColor || '#0D9488',
        currency: schoolSettings.currency || 'USD',
        currencySymbol: schoolSettings.currencySymbol || '$',
        facebookUrl: schoolSettings.facebookUrl || '',
        twitterUrl: schoolSettings.twitterUrl || '',
        instagramUrl: schoolSettings.instagramUrl || '',
        privacyPolicy: schoolSettings.privacyPolicy || '',
        termsAndConditions: schoolSettings.termsAndConditions || ''
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

  const handleCurrencyChange = (code: string) => {
    const selected = CURRENCIES.find(c => c.code === code);
    if (selected) {
      setFormData({
        ...formData,
        currency: selected.code,
        currencySymbol: selected.symbol
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
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
            <Settings className="h-6 w-6" style={{ color: formData.primaryColor }} />
            System Administration
          </h1>
          <p className="text-sm text-gray-500">Configure global institutional settings and platform behavior.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2" style={{ backgroundColor: formData.primaryColor }}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="institution" className="w-full">
        <TabsList className="bg-white border border-gray-100 p-1 rounded-xl shadow-sm h-auto gap-1 mb-6">
          <TabsTrigger value="institution" className="px-4 py-2 text-xs rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Institution Profile</TabsTrigger>
          <TabsTrigger value="branding" className="px-4 py-2 text-xs rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Branding & Social</TabsTrigger>
          <TabsTrigger value="legal" className="px-4 py-2 text-xs rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Legal & Policies</TabsTrigger>
          <TabsTrigger value="academic" className="px-4 py-2 text-xs rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Academic Sessions</TabsTrigger>
          <TabsTrigger value="finance" className="px-4 py-2 text-xs rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Finance & Localization</TabsTrigger>
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
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">School Full Name</Label>
                    <Input 
                      placeholder="e.g. Sunrise Academy" 
                      value={formData.schoolName}
                      onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Short Name / Code</Label>
                    <Input 
                      placeholder="e.g. SA" 
                      value={formData.shortName}
                      onChange={(e) => setFormData({...formData, shortName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                    <Quote className="h-3 w-3" /> School Motto
                  </Label>
                  <Input 
                    placeholder="e.g. Knowledge is Power" 
                    value={formData.motto}
                    onChange={(e) => setFormData({...formData, motto: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Institutional Email</Label>
                  <Input 
                    type="email" 
                    placeholder="admin@school.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Office Phone</Label>
                  <Input 
                    placeholder="+263 7..." 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Physical Address</Label>
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
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg text-white overflow-hidden"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold">{formData.shortName?.[0] || 'E'}</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{formData.schoolName || 'Institution Name'}</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{formData.shortName || 'CODE'}</p>
                  {formData.motto && (
                    <p className="text-[10px] text-gray-500 mt-2 italic">"{formData.motto}"</p>
                  )}
                </div>
                <div className="w-full pt-4 border-t border-gray-200 text-left space-y-2">
                  <p className="text-[10px] text-gray-500 flex items-center gap-2"><Mail className="h-3 w-3" /> {formData.email || 'not set'}</p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-2"><Phone className="h-3 w-3" /> {formData.phone || 'not set'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm">Institutional Visual Identity</CardTitle>
                <CardDescription className="text-xs">Select your brand color and upload your school logo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[11px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                    <Palette className="h-3 w-3" /> Brand Primary Color
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setFormData(prev => ({ ...prev, primaryColor: color.value }))}
                        className={`h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
                          formData.primaryColor === color.value ? 'border-gray-800 scale-105 shadow-sm' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {formData.primaryColor === color.value && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                    <LinkIcon className="h-3 w-3" /> Logo Image URL
                  </Label>
                  <Input 
                    placeholder="https://example.com/logo.png" 
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                    <Upload className="h-3 w-3" /> Upload Logo File
                  </Label>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="text-xs" 
                    onChange={handleLogoUpload}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm">Social Presence</CardTitle>
                <CardDescription className="text-xs">Connect your institution's social media accounts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                    <Facebook className="h-3.5 w-3.5 text-blue-600" /> Facebook Page URL
                  </Label>
                  <Input 
                    placeholder="https://facebook.com/yourschool" 
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({...formData, facebookUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                    <Twitter className="h-3.5 w-3.5 text-sky-500" /> Twitter (X) URL
                  </Label>
                  <Input 
                    placeholder="https://twitter.com/yourschool" 
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({...formData, twitterUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                    <Instagram className="h-3.5 w-3.5 text-pink-600" /> Instagram URL
                  </Label>
                  <Input 
                    placeholder="https://instagram.com/yourschool" 
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({...formData, instagramUrl: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="legal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" /> Terms & Conditions
                </CardTitle>
                <CardDescription className="text-xs">Institutional terms for parents and staff.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Enter your school's terms and conditions here..."
                  className="min-h-[300px] text-xs leading-relaxed"
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData({...formData, termsAndConditions: e.target.value})}
                />
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-teal-600" /> Privacy Policy
                </CardTitle>
                <CardDescription className="text-xs">Data handling and student privacy policies.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Enter your privacy policy details here..."
                  className="min-h-[300px] text-xs leading-relaxed"
                  value={formData.privacyPolicy}
                  onChange={(e) => setFormData({...formData, privacyPolicy: e.target.value})}
                />
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
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active Academic Year</Label>
                    <Input 
                      placeholder="2026" 
                      value={formData.currentYear}
                      onChange={(e) => setFormData({...formData, currentYear: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Current Term</Label>
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
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-gray-800">Operational Update</p>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                      Changing these settings will update all dashboards, report card headers, and attendance registers across the entire institution instantly.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Finance & Localization</CardTitle>
              <CardDescription className="text-xs">Configure how currency and billing information is displayed globally.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                      <DollarSign className="h-3 w-3" /> Institutional Currency
                    </Label>
                    <Select value={formData.currency} onValueChange={handleCurrencyChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.name} ({c.code} - {c.symbol})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-tight">Localization Preview</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-blue-900">{formData.currencySymbol}1,250.00</span>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{formData.currency}</span>
                    </div>
                    <p className="text-[10px] text-blue-600 mt-2 italic leading-relaxed">
                      All financial modules, pupil ledgers, and inventory valuations will use this formatting.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Currency Code (Read Only)</Label>
                    <Input value={formData.currency} readOnly className="bg-gray-50 font-mono text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Symbol (Read Only)</Label>
                    <Input value={formData.currencySymbol} readOnly className="bg-gray-50 font-mono text-xs" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
