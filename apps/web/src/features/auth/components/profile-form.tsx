'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/src/shared/ui/button';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';

import { useAuthActions } from '../hooks/use-auth-actions';
import { useSession } from '../hooks/use-session';

export function ProfileForm() {
  const { user } = useSession();
  const { updateProfile } = useAuthActions();
  const [name, setName] = useState(user?.name ?? '');

  if (!user) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateProfile({ name });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" defaultValue={user.email} disabled />
        <p className="text-xs text-muted-foreground">Email changes require re-verification.</p>
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  );
}
