
"use client"

import { useState } from 'react';
import { 
  Globe, 
  Cloud, 
  MessageCircle, 
  CreditCard, 
  Database, 
  Zap, 
  ExternalLink,
  Loader2,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [activeServices, setActiveServices] = useState<string[]>(['firebase', 'google-workspace']);

  const toggleService = (id: string) => {
    if (activeServices.includes(id)) {
      setActiveServices(activeServices.filter(s => s !== id));
      toast({ title: "Integration Disabled", description: `${id} has been disconnected.` });
    } else {
      setActiveServices([...activeServices, id]);
      toast({ title: "Integration Enabled", description: `Connecting to ${id}...` });
    }
  };

  const services = [
    { 
      id: 'firebase', 
      name: 'Firebase Realtime DB', 
      desc: 'Live synchronization for all institutional data nodes.', 
      icon: <Database className="h-5 w-5 text-orange-500" />,
      category: 'Data',
      connected: true
    },
    { 
      id: 'google-workspace', 
      name: 'Google Workspace', 
      desc: 'Sync student emails and teacher calendars.', 
      icon: <Globe className="h-5 w-5 text-blue-500" />,
      category: 'Academic',
      connected: true
    },
    { 
      id: 'stripe', 
      name: 'Stripe Payments', 
      desc: 'Process school fees and catering subscriptions online.', 
      icon: <CreditCard className="h-5 w-5 text-indigo-600" />,
      category: 'Finance',
      connected: false
    },
    { 
      id: 'whatsapp', 
      name: 'WhatsApp Business', 
      desc: 'Automated attendance alerts and emergency broadcasts.', 
      icon: <MessageCircle className="h-5 w-5 text-green-500" />,
      category: 'Communication',
      connected: false
    },
    { 
      id: 'zoom', 
      name: 'Zoom Education', 
      desc: 'Auto-schedule virtual classrooms and parent conferences.', 
      icon: <Zap className="h-5 w-5 text-sky-500" />,
      category: 'Academic',
      connected: false
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Globe className="h-6 w-6 text-blue-600" />
            External Integrations
          </h1>
          <p className="text-sm text-gray-500">Connect EduCare360 with your favorite educational and financial tools.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
          <Cloud className="h-3.5 w-3.5" /> API Cloud Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  {service.icon}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    activeServices.includes(service.id) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {activeServices.includes(service.id) ? 'Active' : 'Disconnected'}
                  </span>
                  <Switch 
                    checked={activeServices.includes(service.id)} 
                    onCheckedChange={() => toggleService(service.id)}
                  />
                </div>
              </div>
              <CardTitle className="text-sm mt-4">{service.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">{service.desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{service.category}</span>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 py-3 flex justify-between items-center">
              <button className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
                View Docs <ExternalLink className="h-2.5 w-2.5" />
              </button>
              {activeServices.includes(service.id) && (
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" /> Connected
                </span>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
