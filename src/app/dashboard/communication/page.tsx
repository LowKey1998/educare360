
"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Sparkles, 
  Send, 
  Copy, 
  RefreshCcw, 
  MessageSquare,
  Wand2,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { aiCommunicationDraftTool } from '@/ai/flows/ai-communication-draft-tool';
import { useToast } from '@/hooks/use-toast';
import { useDatabase, useUserProfile, useRTDBDoc } from '@/firebase';
import { systemService } from '@/services/system';

export default function CommunicationPage() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [formData, setFormData] = useState({
    type: 'newsletter' as const,
    audience: '',
    context: '',
    systemData: 'Current Term: 2026 Term 1. Upcoming: Inter-house sports competition next Friday.'
  });
  
  const database = useDatabase();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const { data: schoolSettings } = useRTDBDoc(database, 'system_settings');
  const schoolName = schoolSettings?.schoolName || 'EduCare360';

  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';

  const handleGenerate = async () => {
    if (!formData.audience) {
      toast({
        title: "Missing Information",
        description: "Please specify the target audience for the communication.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await aiCommunicationDraftTool({
        communicationType: formData.type,
        audience: formData.audience,
        additionalContext: formData.context,
        systemData: formData.systemData
      });
      setDraft(result);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "The AI was unable to generate a draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnnoucement = async () => {
    if (!draft || !isAdmin) return;
    setSending(true);
    try {
      await systemService.postAnnouncement(database, {
        content: draft,
        communicationType: formData.type,
        audience: formData.audience
      });
      toast({ 
        title: "Announcement Dispatched", 
        description: "The message has been saved and parents have been notified." 
      });
      setDraft('');
    } catch (e) {
      toast({ title: "Error", description: "Failed to post announcement.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft);
    toast({
      title: "Copied!",
      description: "Draft has been copied to your clipboard.",
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles className="h-48 w-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Communication Studio</h1>
              <p className="text-white/80 text-sm">Draft professional, data-enriched school communications in seconds.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <Card className="md:col-span-2 border-gray-100 h-fit shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Draft Configuration</CardTitle>
            <CardDescription className="text-xs">Define the context for the AI assistant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gray-500 uppercase">Communication Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v: any) => setFormData(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger className="text-xs h-10 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newsletter">Weekly Newsletter</SelectItem>
                  <SelectItem value="attendance notification">Attendance Alert</SelectItem>
                  <SelectItem value="event announcement">Event Announcement</SelectItem>
                  <SelectItem value="general update">General Update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gray-500 uppercase">Target Audience</Label>
              <Input 
                placeholder="e.g. All Parents, Grade 7 Guardians" 
                className="text-xs h-10 border-gray-200"
                value={formData.audience}
                onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gray-500 uppercase">Additional Context</Label>
              <Textarea 
                placeholder="Key points to include..." 
                className="h-28 resize-none text-xs border-gray-200"
                value={formData.context}
                onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full h-11 gap-2 bg-teal-600 hover:bg-teal-700 font-bold shadow-lg shadow-teal-600/20" 
              onClick={handleGenerate} 
              disabled={loading || !isAdmin}
            >
              {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {loading ? 'Synthesizing...' : 'Generate AI Draft'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-3 border-gray-100 flex flex-col min-h-[550px] relative overflow-hidden shadow-sm">
          <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between space-y-0 bg-gray-50/30">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Generated Content</CardTitle>
              <CardDescription className="text-[10px]">Review and refine the draft before sending.</CardDescription>
            </div>
            {draft && (
              <Button variant="ghost" size="icon" onClick={copyToClipboard} className="text-gray-400 hover:text-teal-600">
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 p-0">
            {draft ? (
              <textarea
                className="w-full h-full p-8 bg-transparent resize-none focus:outline-none font-sans text-sm leading-relaxed text-gray-700 custom-scrollbar"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <Sparkles className="h-10 w-10 text-teal-600/20" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-400 text-sm uppercase tracking-tighter">Draft Canvas Empty</h3>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mt-2 leading-relaxed">
                    Configure your message on the left and let {schoolName} AI craft a tailored communication for your school.
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          {draft && isAdmin && (
            <CardFooter className="border-t border-gray-50 bg-gray-50/50 p-5 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Draft ready for dispatch
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => setDraft('')} className="text-gray-500 h-9 px-4">
                  Discard
                </Button>
                <Button onClick={handleSendAnnoucement} disabled={sending} className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-9 px-6 font-bold">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Finalize & Send
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
