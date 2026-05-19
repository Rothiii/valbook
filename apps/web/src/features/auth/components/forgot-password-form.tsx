'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/src/shared/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/shared/ui/form';
import { Input } from '@/src/shared/ui/input';

import { useAuthActions } from '../hooks/use-auth-actions';
import { type ForgotPasswordInput, forgotPasswordSchema } from '../schema';

export function ForgotPasswordForm() {
  const router = useRouter();
  const { forgotPassword } = useAuthActions();
  const [pending, setPending] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  function onSubmit(values: ForgotPasswordInput) {
    setPending(true);
    try {
      const { token } = forgotPassword(values.email);
      toast.success('Reset link sent. Check your email.');
      if (token !== 'no-op') {
        // Slicing mode: route directly since email is fake.
        router.push(`/reset-password/${token}`);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </Form>
  );
}
