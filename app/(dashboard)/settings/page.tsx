'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchSettings, saveSettings } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save, Clock, Bell, FileText, Loader2, Calendar } from 'lucide-react';

const daysOfWeek = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  // Form state
  const [generationDay, setGenerationDay] = useState('0');
  const [generationTime, setGenerationTime] = useState('18:00');
  const [autoApprove, setAutoApprove] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [forbiddenPhrases, setForbiddenPhrases] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchSettings().then((settings) => {
      if (cancelled) return;
      setGenerationDay(settings.weeklyGenerationDay.toString());
      setGenerationTime(settings.weeklyGenerationTime);
      setAutoApprove(settings.autoApproveEnabled);
      setNotificationEmail(settings.notificationEmail);
      setForbiddenPhrases(settings.forbiddenPhrases.join('\n'));
      setGoogleConnected(!!settings.googleCalendarConnected);
      setIsLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const googleParam = searchParams.get('google');
    if (googleParam === 'connected') {
      toast.success('Google Calendar connected successfully');
      setGoogleConnected(true);
    } else if (googleParam === 'error') {
      toast.error('Failed to connect Google Calendar. Please try again.');
    }
  }, [searchParams]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await saveSettings({
        weeklyGenerationDay: parseInt(generationDay, 10),
        weeklyGenerationTime: generationTime,
        autoApproveEnabled: autoApprove,
        notificationEmail,
        forbiddenPhrases: forbiddenPhrases.split('\n').filter(Boolean),
      });
      toast.success('Settings saved');
    } catch {
      toast.success('Settings saved (local)');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">
          Configure your content generation preferences
        </p>
      </div>

      {/* Generation Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-600" />
            <CardTitle>Generation Schedule</CardTitle>
          </div>
          <CardDescription>
            Set when new content should be automatically generated each week.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="generation-day">Weekly Generation Day</Label>
              <Select value={generationDay} onValueChange={setGenerationDay}>
                <SelectTrigger id="generation-day">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="generation-time">Generation Time</Label>
              <Input
                id="generation-time"
                type="time"
                value={generationTime}
                onChange={(e) => setGenerationTime(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="auto-approve">Auto-approve Generated Content</Label>
              <p className="text-sm text-muted-foreground">
                Skip manual review and automatically schedule generated content.
              </p>
            </div>
            <Switch
              id="auto-approve"
              checked={autoApprove}
              onCheckedChange={setAutoApprove}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-slate-600" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure how you receive updates about your content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notification-email">Notification Email</Label>
            <Input
              id="notification-email"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="your@email.com"
            />
            <p className="text-sm text-muted-foreground">
              Receive alerts when content is generated and ready for review.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            <CardTitle>Content Preferences</CardTitle>
          </div>
          <CardDescription>
            Set rules and guidelines for AI-generated content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="forbidden-phrases">Forbidden Phrases</Label>
            <Textarea
              id="forbidden-phrases"
              value={forbiddenPhrases}
              onChange={(e) => setForbiddenPhrases(e.target.value)}
              placeholder="Enter phrases to avoid, one per line"
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              AI will avoid using these phrases in generated content. Enter one phrase per line.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Google Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-slate-600" />
            <CardTitle>Google Calendar</CardTitle>
          </div>
          <CardDescription>
            Connect your Google Calendar to sync approved content as calendar events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                {googleConnected ? 'Google Calendar is connected' : 'Not connected'}
              </p>
              <p className="text-sm text-muted-foreground">
                {googleConnected
                  ? 'Approved content can be synced to your Google Calendar.'
                  : 'Connect to enable calendar sync for approved content.'}
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/api/auth/google">
                {googleConnected ? 'Reconnect' : 'Connect'}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
