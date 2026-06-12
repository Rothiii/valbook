'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AuthGuard } from '@/src/features/auth/components/auth-guard';
import { EmailVerificationCard } from '@/src/features/auth/components/email-verification-card';
import { LogoutButton } from '@/src/features/auth/components/logout-button';
import { ProfileForm } from '@/src/features/auth/components/profile-form';
import { useNavHistory } from '@/src/shared/lib/nav-history';
import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { PageHeader } from '@/src/shared/ui/page-header';

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountPageContent />
    </AuthGuard>
  );
}

function AccountPageContent() {
  const router = useRouter();
  const getPrevious = useNavHistory((s) => s.previous);

  function goBack() {
    router.push(getPrevious() ?? '/app');
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-background px-6 py-8 text-foreground">
      <Button
        variant="ghost"
        size="sm"
        onClick={goBack}
        className="mb-4 -ml-2 text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <PageHeader title="Account" description="Manage your profile, security, and sessions." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Display name and email.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>

        <EmailVerificationCard />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Password</CardTitle>
            <CardDescription>Change your account password (Phase 1+).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>Change password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sessions</CardTitle>
            <CardDescription>Sign out of this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <LogoutButton />
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
            <CardDescription>Account deletion (Phase 6).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" disabled>
              Delete account
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
