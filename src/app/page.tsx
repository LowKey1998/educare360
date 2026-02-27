import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { GraduationCap, ShieldCheck, Users, Calendar, BarChart3, MessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="max-w-5xl w-full space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4 animate-in fade-in zoom-in duration-500">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground font-headline">
            EduCare<span className="text-primary">360</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The next-generation, AI-powered educational management ecosystem for modern institutions.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<ShieldCheck className="w-5 h-5 text-primary" />}
            title="Secure & Reliable"
            description="Enterprise-grade security powered by Firebase for your institution's data."
          />
          <FeatureCard 
            icon={<MessageSquare className="w-5 h-5 text-accent" />}
            title="AI Communication"
            description="Smart draft tools to automate newsletters and notifications."
          />
          <FeatureCard 
            icon={<BarChart3 className="w-5 h-5 text-primary" />}
            title="Deep Insights"
            description="Real-time analytics on attendance, enrollment, and performance."
          />
        </div>

        <Card className="max-w-md mx-auto border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold font-headline">Portal Access</CardTitle>
            <CardDescription>Select your role to continue to the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/dashboard?role=admin" className="w-full">
              <Button className="w-full justify-start h-12 text-base font-medium" variant="default">
                <ShieldCheck className="mr-2 h-5 w-5" />
                Administrator Login
              </Button>
            </Link>
            <Link href="/dashboard?role=teacher" className="w-full">
              <Button className="w-full justify-start h-12 text-base font-medium" variant="outline">
                <Users className="mr-2 h-5 w-5" />
                Teacher Portal
              </Button>
            </Link>
            <Link href="/dashboard?role=parent" className="w-full">
              <Button className="w-full justify-start h-12 text-base font-medium" variant="ghost">
                <Calendar className="mr-2 h-5 w-5" />
                Parent Engagement
              </Button>
            </Link>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">© 2024 EduCare360. Empowering growth through digital clarity.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card/30 hover:bg-card/50 transition-colors group">
      <div className="mb-3 p-2 rounded-lg bg-muted w-fit group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 font-headline">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}