'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from '@/src/features/auth/hooks/use-session';
import { notify } from '@/src/shared/lib/notify';
import { Button } from '@/src/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/shared/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/shared/ui/form';
import { Input } from '@/src/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select';

import { useMembershipActions } from '../hooks/use-workspace-actions';
import { type InviteMemberInput, inviteMemberSchema } from '../schema';

export function InviteMemberDialog({
  workspaceId,
  open,
  onOpenChange,
}: {
  workspaceId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { user } = useSession();
  const { inviteMember } = useMembershipActions();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next);
    else setInternalOpen(next);
  };
  const [lastToken, setLastToken] = useState<string | null>(null);

  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { workspaceId, email: '', role: 'editor', customMessage: '' },
  });

  function onSubmit(values: InviteMemberInput) {
    if (!user) return;
    try {
      const invitation = inviteMember({
        ...values,
        actorId: user.id,
        actorName: user.name,
      });
      notify.success('Invitation sent');
      setLastToken(invitation.token);
      form.reset({ workspaceId, email: '', role: 'editor', customMessage: '' });
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Failed');
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {isControlled ? null : (
        <DialogTrigger asChild>
          <Button>+ Invite</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            They'll receive a link to accept and join this workspace.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="teammate@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="editor">Editor — manage assets</SelectItem>
                      <SelectItem value="viewer">Viewer — read only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} placeholder="" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {lastToken ? (
              <div className="border border-border bg-muted/30 p-3 text-xs">
                <p className="mb-1 uppercase tracking-wider text-muted-foreground">
                  Mock invite link (slicing mode)
                </p>
                <code className="break-all">/invite/{lastToken}</code>
              </div>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              <Button type="submit">Send invite</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
