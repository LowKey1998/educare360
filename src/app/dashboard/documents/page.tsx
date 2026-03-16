
"use client"

import { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  PanelsTopLeft, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CircleCheckBig, 
  Mail, 
  DollarSign, 
  CreditCard, 
  Award, 
  SquarePen, 
  Search, 
  Plus, 
  Image as ImageIcon, 
  Type, 
  Table2, 
  Eye, 
  PenLine, 
  Copy, 
  Trash2,
  Users,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDatabase, useRTDBCollection } from '@/firebase';
import { ref, push, remove, serverTimestamp } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

const TEMPLATES_DATA = [
  {
    id: 'RCT-001',
    title: 'Primary School Report Card',
    term: 'Term 1 2026',
    grades: ['Grade 1', 'Grade 2', 'Grade 3'],
    fields: 10,
    format: 'A4 portrait',
    status: 'Active',
    type: 'report-cards'
  },
  {
    id: 'RCT-002',
    title: 'ECD Progress Report',
    term: 'Term 1 2026',
    grades: ['Baby Class', 'Middle Class', 'Reception'],
    fields: 6,
    format: 'A4 portrait',
    status: 'Active',
    type: 'report-cards'
  },
  {
    id: 'RCT-003',
    title: 'Term 2 Report Template',
    term: 'Term 2 2026',
    grades: ['Grade 1', 'Grade 2', 'Grade 3'],
    fields: 3,
    format: 'A4 portrait',
    status: 'Draft',
    type: 'report-cards'
  }
];

export default function DocumentBuilderPage() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('report-cards');
  const database = useDatabase();
  const { toast } = useToast();
  
  // Real-time templates from database (if any exist)
  const { data: dbTemplates, loading } = useRTDBCollection(database, 'document_templates');

  const allTemplates = useMemo(() => {
    const combined = [...TEMPLATES_DATA];
    dbTemplates.forEach(t => {
      if (!combined.find(ct => ct.id === t.id)) {
        combined.push(t);
      }
    });
    return combined;
  }, [dbTemplates]);

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(t => 
      (activeType === 'report-cards' || t.type === activeType) &&
      (t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allTemplates, search, activeType]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      if (id.startsWith('RCT-')) {
        toast({ title: "System Template", description: "Demo templates cannot be deleted.", variant: "destructive" });
        return;
      }
      await remove(ref(database, `document_templates/${id}`));
      toast({ title: "Template Removed", description: "The document template was deleted." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete template." });
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Document & Report Builder
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Design templates, generate documents, and manage school paperwork</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => toast({ title: "Exporting", description: "Preparing template bundle..." })}>
            <Download className="h-3.5 w-3.5" /> Export All
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DocStatCard label="Templates Created" value="24" trend="+3" isPositive={true} icon={<PanelsTopLeft className="w-4.5 h-4.5 text-blue-600" />} color="bg-blue-50" />
        <DocStatCard label="Generated This Term" value="1,847" trend="+156" isPositive={true} icon={<FileText className="w-4.5 h-4.5 text-green-600" />} color="bg-green-50" />
        <DocStatCard label="Pending Approvals" value="12" trend="-4" isPositive={false} icon={<Clock className="w-4.5 h-4.5 text-amber-600" />} color="bg-amber-50" />
        <DocStatCard label="Bulk Jobs Complete" value="98%" trend="+2%" isPositive={true} icon={<CircleCheckBig className="w-4.5 h-4.5 text-purple-600" />} color="bg-purple-50" />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Tabs defaultValue="report-cards" className="w-full" onValueChange={setActiveType}>
          <div className="flex border-b border-gray-100 px-2 overflow-x-auto custom-scrollbar">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger value="report-cards" className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">
                <PanelsTopLeft className="w-3.5 h-3.5" /> Report Cards
              </TabsTrigger>
              <TabsTrigger value="admission-letters" className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">
                <Mail className="w-3.5 h-3.5" /> Admission Letters
              </TabsTrigger>
              <TabsTrigger value="fee-statements" className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">
                <DollarSign className="w-3.5 h-3.5" /> Fee Statements
              </TabsTrigger>
              <TabsTrigger value="pupil-id" className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">
                <CreditCard className="w-3.5 h-3.5" /> Pupil ID Cards
              </TabsTrigger>
              <TabsTrigger value="certificates" className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">
                <Award className="w-3.5 h-3.5" /> Certificates
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none shadow-none bg-transparent">
                <SquarePen className="w-3.5 h-3.5" /> Custom Documents
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-5">
            <div className="space-y-4">
              {/* Filters & Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input 
                    placeholder="Search templates..." 
                    className="pl-9 text-xs h-9 border-gray-200" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-gray-600">
                    <Users className="h-3.5 w-3.5" /> Bulk Generate
                  </Button>
                  <Button className="h-9 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium" onClick={() => toast({ title: "Document Studio", description: "Initializing template designer..." })}>
                    <Plus className="h-3.5 w-3.5" /> New Template
                  </Button>
                </div>
              </div>

              {/* Template Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
                  <p className="text-xs text-gray-400 italic">Syncing template library...</p>
                </div>
              ) : filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} onDelete={() => handleDelete(template.id)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No templates found in this category.</p>
                  <p className="text-xs text-gray-300 mt-1">Start by creating a new template or changing filters.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </div>
    </div>
  );
}

function DocStatCard({ label, value, trend, icon, color, isPositive }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${color} text-gray-700`}>{label}</span>
        <span className={`text-[10px] font-bold flex items-center gap-0.5 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
          {trend}
        </span>
      </div>
      <div className="flex items-end justify-between mt-3">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, onDelete }: any) {
  const isDraft = template.status === 'Draft';
  
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 h-44 relative overflow-hidden shrink-0">
        {/* Mock Document Preview */}
        <div className="bg-white rounded-lg shadow-sm p-3 h-full overflow-hidden border border-gray-200 scale-95 origin-top transition-transform group-hover:scale-100">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-4 h-4 rounded flex items-center justify-center bg-amber-100">
              <ImageIcon className="w-2.5 h-2.5 text-amber-700" />
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 w-12"></div>
          </div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded flex items-center justify-center bg-blue-50">
                  <Type className="w-2.5 h-2.5 text-blue-400" />
                </div>
                <div className="h-1 rounded-full bg-gray-50" style={{ width: `${Math.random() * 60 + 30}%` }}></div>
              </div>
            ))}
            <div className="flex items-center gap-1.5 pt-1">
              <div className="w-4 h-4 rounded flex items-center justify-center bg-indigo-50">
                <Table2 className="w-2.5 h-2.5 text-indigo-400" />
              </div>
              <div className="h-4 rounded bg-gray-50 w-full"></div>
            </div>
          </div>
          <p className="text-[8px] text-gray-300 mt-2">+{template.fields - 5} more fields</p>
        </div>
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
          isDraft ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
        }`}>
          {template.status}
        </span>
      </div>
      
      <div className="p-4 flex-1">
        <p className="text-xs font-bold text-gray-800 leading-tight">{template.title}</p>
        <p className="text-[10px] text-gray-400 mt-1 font-medium">{template.id} | {template.term}</p>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {(template.grades || []).map((grade: string) => (
            <span key={grade} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase tracking-wider">
              {grade}
            </span>
          ))}
          {template.grades?.length > 3 && <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[9px] font-bold">+{template.grades.length - 3}</span>}
        </div>
        
        <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400 font-medium">
          <span className="flex items-center gap-1"><PanelsTopLeft className="h-3 w-3" /> {template.fields} fields</span>
          <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {template.format}</span>
        </div>
      </div>

      <div className="px-3 py-2 bg-gray-50 flex items-center gap-1 justify-end border-t border-gray-100">
        <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-teal-600 transition-colors" title="Preview"><Eye className="h-3.5 w-3.5" /></button>
        <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-blue-600 transition-colors" title="Design"><PenLine className="h-3.5 w-3.5" /></button>
        <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-purple-600 transition-colors" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
        <button className="px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-white text-gray-500 uppercase tracking-tighter transition-colors">
          {template.status === 'Active' ? 'Deactivate' : 'Activate'}
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}
