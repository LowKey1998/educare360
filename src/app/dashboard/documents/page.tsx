
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
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useDatabase, useRTDBCollection, useRTDBDoc } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { systemService } from '@/services/system';
import { DocumentTemplate, Student } from '@/lib/types';

const GRADES = ['Reception', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];

const DEFAULT_TEMPLATES: Partial<DocumentTemplate>[] = [
  {
    title: 'Standard Report Card',
    type: 'report-cards',
    grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'],
    fields: 12,
    format: 'A4 Portrait',
    status: 'Active'
  },
  {
    title: 'Admission Welcome Letter',
    type: 'admission-letters',
    grades: ['All'],
    fields: 5,
    format: 'Letter Portrait',
    status: 'Active'
  }
];

export default function DocumentBuilderPage() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('report-cards');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudentIds] = useState<string[]>([]);
  
  const database = useDatabase();
  const { toast } = useToast();
  const { data: dbTemplates, loading: templatesLoading } = useRTDBCollection<DocumentTemplate>(database, 'document_templates');
  const { data: students } = useRTDBCollection<Student>(database, 'students');
  const { data: schoolSettings } = useRTDBDoc(database, 'system_settings');

  const filteredTemplates = useMemo(() => {
    return dbTemplates.filter(t => 
      (activeType === 'all' || t.type === activeType) &&
      (t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()))
    );
  }, [dbTemplates, search, activeType]);

  const stats = useMemo(() => {
    return {
      templatesCount: dbTemplates.length,
      activeCount: dbTemplates.filter(t => t.status === 'Active').length,
      draftCount: dbTemplates.filter(t => t.status === 'Draft').length
    };
  }, [dbTemplates]);

  const handleCreateTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const data: Omit<DocumentTemplate, 'id' | 'createdAt'> = {
      title: formData.get('title') as string,
      type: formData.get('type') as any,
      term: schoolSettings?.currentTerm || 'Term 1',
      grades: selectedGrades,
      fields: parseInt(formData.get('fields') as string) || 5,
      format: formData.get('format') as string || 'A4 Portrait',
      status: 'Active'
    };

    try {
      await systemService.addTemplate(database, data);
      setIsAddOpen(false);
      setSelectedGrades([]);
      toast({ title: "Template Created", description: `"${data.title}" is ready for use.` });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkGenerate = async () => {
    setIsGenerating(true);
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setIsBulkOpen(false);
    setSelectedStudentIds([]);
    toast({ 
      title: "Batch Job Complete", 
      description: `Successfully generated documents for ${selectedStudents.length} pupils.` 
    });
  };

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <PanelsTopLeft className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Document & Report Builder</h2>
            <p className="text-sm text-white/80 mt-1">Design academic transcripts, ID cards, and institutional stationary</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DocStatCard label="Total Templates" value={templatesLoading ? '...' : stats.templatesCount.toString()} trend="Live Registry" icon={<PanelsTopLeft className="w-4 h-4 text-blue-600" />} color="bg-blue-50" />
        <DocStatCard label="Active Status" value={stats.activeCount.toString()} trend="Production" icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} color="bg-emerald-50" />
        <DocStatCard label="Drafts" value={stats.draftCount.toString()} trend="In Design" icon={<Clock className="w-4 h-4 text-amber-600" />} color="bg-amber-50" />
        <DocStatCard label="Generation Jobs" value="98%" trend="Successful" icon={<CircleCheckBig className="w-4 h-4 text-purple-600" />} color="bg-purple-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Tabs defaultValue="report-cards" className="w-full" onValueChange={setActiveType}>
          <div className="flex border-b border-gray-100 px-2 overflow-x-auto bg-gray-50/30">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger value="report-cards" className="flex items-center gap-1.5 px-6 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none bg-transparent">
                <FileText className="w-3.5 h-3.5" /> Report Cards
              </TabsTrigger>
              <TabsTrigger value="admission-letters" className="flex items-center gap-1.5 px-6 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none bg-transparent">
                <Mail className="w-3.5 h-3.5" /> Admission Letters
              </TabsTrigger>
              <TabsTrigger value="pupil-id" className="flex items-center gap-1.5 px-6 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none bg-transparent">
                <CreditCard className="w-3.5 h-3.5" /> Pupil IDs
              </TabsTrigger>
              <TabsTrigger value="certificates" className="flex items-center gap-1.5 px-6 py-3 text-xs font-bold uppercase tracking-tight border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none bg-transparent">
                <Award className="w-3.5 h-3.5" /> Awards
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-5">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input 
                    placeholder="Search templates..." 
                    className="pl-9 text-xs h-10" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 gap-1.5 font-bold">
                        <Users className="h-3.5 w-3.5" /> Bulk Generate
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Document Generation Engine</DialogTitle>
                        <DialogDescription>Select pupils to generate documents from active templates.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                          <Input placeholder="Filter student list..." className="pl-9 text-xs" />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto border rounded-xl divide-y custom-scrollbar">
                          {students.map(s => (
                            <div key={s.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer" onClick={() => toggleStudent(s.id)}>
                              <Checkbox checked={selectedStudents.includes(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate">{s.studentName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{s.grade}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button disabled={selectedStudents.length === 0 || isGenerating} onClick={handleBulkGenerate} className="w-full bg-indigo-600">
                          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <SquarePen className="h-4 w-4 mr-2" />}
                          Generate {selectedStudents.length} Documents
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-10 gap-1.5 bg-indigo-600 hover:bg-indigo-700 font-bold">
                        <Plus className="h-3.5 w-3.5" /> New Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <form onSubmit={handleCreateTemplate}>
                        <DialogHeader>
                          <DialogTitle>Design New Template</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label>Template Title</Label>
                            <Input name="title" placeholder="e.g. End of Term Performance Report" required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Document Type</Label>
                              <Select name="type" defaultValue="report-cards">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="report-cards">Report Card</SelectItem>
                                  <SelectItem value="admission-letters">Admission Letter</SelectItem>
                                  <SelectItem value="pupil-id">Pupil ID Card</SelectItem>
                                  <SelectItem value="certificates">Award Certificate</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Format</Label>
                              <Input name="format" placeholder="A4 Portrait" defaultValue="A4 Portrait" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Apply to Grades</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {GRADES.map(g => (
                                <div key={g} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toggleGrade(g)}>
                                  <Checkbox checked={selectedGrades.includes(g)} onCheckedChange={() => toggleGrade(g)} />
                                  <span className="text-[10px] font-bold text-gray-600">{g}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Data Fields Count</Label>
                            <Input name="fields" type="number" defaultValue="10" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600">
                            Confirm Design
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {templatesLoading ? (
                <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-600" /></div>
              ) : filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <TemplateCard 
                      key={template.id} 
                      template={template} 
                      onDelete={() => systemService.deleteTemplate(database, template.id)} 
                      onToggleStatus={() => systemService.updateTemplateStatus(database, template.id, template.status === 'Active' ? 'Draft' : 'Active')}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                  <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No templates matching your filters.</p>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function DocStatCard({ label, value, trend, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</span>
        <span className="text-[10px] font-bold text-gray-400">{trend}</span>
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

function TemplateCard({ template, onDelete, onToggleStatus }: any) {
  const isDraft = template.status === 'Draft';
  
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 h-40 relative overflow-hidden shrink-0">
        <div className="bg-white rounded-lg shadow-sm p-3 h-full overflow-hidden border border-gray-200 scale-95 origin-top transition-transform group-hover:scale-100">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-4 h-4 rounded flex items-center justify-center bg-amber-100"><ImageIcon className="w-2.5 h-2.5 text-amber-700" /></div>
            <div className="h-1.5 rounded-full bg-gray-100 w-12"></div>
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded flex items-center justify-center bg-blue-50"><Type className="w-2.5 h-2.5 text-blue-400" /></div>
                <div className="h-1 rounded-full bg-gray-50" style={{ width: `${Math.random() * 60 + 30}%` }}></div>
              </div>
            ))}
          </div>
        </div>
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm ${
          isDraft ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {template.status}
        </span>
      </div>
      
      <div className="p-4 flex-1">
        <p className="text-xs font-bold text-gray-800 leading-tight">{template.title}</p>
        <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-tighter">{template.term}</p>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {(template.grades || []).slice(0, 3).map((grade: string) => (
            <span key={grade} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-bold uppercase">
              {grade}
            </span>
          ))}
          {template.grades?.length > 3 && <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[8px] font-bold">+{template.grades.length - 3}</span>}
        </div>
      </div>

      <div className="px-3 py-2 bg-gray-50 flex items-center gap-1 justify-end border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 text-gray-400 hover:text-indigo-600" title="Preview"><Eye className="h-3.5 w-3.5" /></button>
        <button className="p-1.5 text-gray-400 hover:text-blue-600" title="Design"><PenLine className="h-3.5 w-3.5" /></button>
        <button onClick={onToggleStatus} className="text-[9px] font-bold text-gray-500 uppercase px-2 hover:bg-white rounded py-1">{isDraft ? 'Activate' : 'Draft'}</button>
        <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-rose-600" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}
