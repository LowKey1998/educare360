
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
  Loader2
} from 'lucide-react';
import { aiCommunicationDraftTool } from '@/ai/flows/ai-communication-draft-tool';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';

export default function CommunicationPage() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [formData, setFormData] = useState({
    type: 'newsletter' as const,
    audience: '',
    context: '',
    systemData: 'Current Term: Spring 2026. Next Event: Mid-Term Exams on March 1st.'
  });
  
  const database = useDatabase();
  const { toast } = useToast();

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
    if (!draft) return;
    setSending(true);
    try {
      await push(ref(database, 'announcements'), {
        content: draft,
        communicationType: formData.type,
        audience: formData.audience,
        createdAt: serverTimestamp()
      });
      toast({ title: "Announcement Sent", description: "This message is now visible in parent portals." });
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2 flex items-center gap-3 text-gray-800">
            <MessageSquare className="h-8 w-8 text-teal-600" />
            AI Communication Tool
          </h1>
          <p className="text-muted-foreground text-sm">Draft professional school communications in seconds using AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <Card className="md:col-span-2 border-border/50 h-fit shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Draft Configuration</CardTitle>
            <CardDescription className="text-xs">Configure the message details below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Communication Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v: any) => setFormData(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger id="type" className="text-xs">
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
              <Label htmlFor="audience">Target Audience</Label>
              <Input 
                id="audience" 
                placeholder="e.g. Parents of Grade 5 students" 
                className="text-xs"
                value={formData.audience}
                onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Additional Context (Optional)</Label>
              <Textarea 
                id="context" 
                placeholder="e.g. Remind them to bring extra water for sports day." 
                className="h-24 resize-none text-xs"
                value={formData.context}
                onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full h-11 gap-2 bg-teal-600 hover:bg-teal-700" 
              onClick={handleGenerate} 
              disabled={loading}
            >
              {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {loading ? 'Analyzing Data...' : 'Generate AI Draft'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-3 border-border/50 flex flex-col min-h-[500px] relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-5">
            <Sparkles className="h-48 w-48 text-teal-600" />
          </div>
          
          <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Generated Draft</CardTitle>
              <CardDescription className="text-xs">Review and refine the AI generated content.</CardDescription>
            </div>
            {draft && (
              <Button variant="ghost" size="icon" onClick={copyToClipboard} title="Copy Content">
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 p-0">
            {draft ? (
              <textarea
                className="w-full h-full p-6 bg-transparent resize-none focus:outline-none font-sans text-sm leading-relaxed text-foreground/90 custom-scrollbar"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="p-4 bg-gray-50 rounded-full">
                  <Sparkles className="h-8 w-8 text-teal-600/30" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">No Draft Generated Yet</h3>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                    Fill in the configuration and click "Generate" to create a contextual communication using your school's data.
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          {draft && (
            <CardFooter className="border-t border-border/50 bg-gray-50/30 p-4 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 italic max-w-[200px]">
                Verify all important dates and details before sending.
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setDraft('')}>
                  Clear
                </Button>
                <Button onClick={handleSendAnnoucement} disabled={sending} className="gap-2 bg-teal-600 hover:bg-teal-700">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Approve & Send
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
