import { useState } from 'react';
import { Settings2, User, Globe, Moon, Sun, Save, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/clerk-react';

export function SettingsPage() {
  const { user } = useUser();

  const [displayName, setDisplayName] = useState(user?.fullName || user?.firstName || 'Orbit User');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [theme, setTheme] = useState<'system' | 'dark' | 'light'>('system');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings"
        description="Manage your account profile, timezone, appearance, and notifications."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Settings */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your display name and email preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="displayName" className="text-sm font-medium text-foreground">
                Display Name
              </label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Primary Email
              </label>
              <Input
                id="email"
                value={user?.primaryEmailAddress?.emailAddress || 'user@example.com'}
                disabled
                className="bg-muted opacity-75"
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional & Timezone */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Timezone & Region
            </CardTitle>
            <CardDescription>Used for deadline notifications and study session logs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="timezone" className="text-sm font-medium text-foreground">
                Timezone
              </label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London (GMT / BST)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              Appearance
            </CardTitle>
            <CardDescription>Choose how Orbit looks to you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                type="button"
                variant={theme === 'light' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button
                type="button"
                variant={theme === 'dark' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
              <Button
                type="button"
                variant={theme === 'system' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setTheme('system')}
              >
                <Settings2 className="w-4 h-4 mr-2" />
                System
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end gap-3">
          <Button type="submit" className="px-6">
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2 text-emerald-400" />
                Saved Changes!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}