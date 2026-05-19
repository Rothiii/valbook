import type { Metadata } from 'next';

import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';
import { PageHeader } from '@/src/shared/ui/page-header';

export const metadata: Metadata = { title: 'Account · Valbook' };

export default function AccountPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-background px-6 py-8 text-foreground">
      <PageHeader title="Account" description="Manage your profile, security, and sessions." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Display name and avatar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Rafid" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="hairian@planet-it.co.id" disabled />
              <p className="text-xs text-muted-foreground">
                Email changes require re-verification.
              </p>
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Password</CardTitle>
            <CardDescription>Change your account password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" />
            </div>
            <Button>Update password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active sessions</CardTitle>
            <CardDescription>Devices currently signed in.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No active sessions yet.</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
            <CardDescription>Permanently delete your account and data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Delete account</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
