'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSetAtom } from 'jotai';
import { Bitcoin, Unlock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';

import { userSessionAtom } from '@/lib/atoms';
import { API_ENDPOINTS } from '@/lib/constants';
import { login } from '@/lib/session-manager';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

import { formSchema } from './schema';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FluidFormElement,
  FormWrapper,
} from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
    },
  });

  const setUserSession = useSetAtom(userSessionAtom);
  const router = useRouter();

  // Fetch users logic
  useEffect(() => {
    let cancelled = false;
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_ENDPOINTS.users);
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        if (!cancelled) {
          setUsers(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    };
    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const handleManualRetry = () => {
    setRetryCount((c) => c + 1);
  };

  const handleLogin = (values: z.infer<typeof formSchema>) => {
    const user = users.find((u) => u.id.toString() === values.userId);
    if (user) {
      // Store session in sessionStorage via session manager
      login(user);

      // Update Jotai atom for immediate UI update
      setUserSession({ user, loginTimestamp: new Date().toISOString() });

      router.push('/dashboard');
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {loading ? (
        <div className="flex flex-col gap-6">
          <div className="text-gray-600">
            <Bitcoin className="animate-pulse" height={300} width={300} />
          </div>
          {retryCount > 0 && (
            <div className="text-gray-500 text-sm">Retry attempt {retryCount}/3</div>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col items-center gap-2">
              <Unlock className="h-10 w-10 text-primary mb-2" />
              <h1 className="font-extrabold text-2xl sm:text-3xl md:text-4xl text-center mb-1">
                Log into your account
              </h1>
            </CardTitle>
            <CardDescription>
              <p className="text-base sm:text-lg opacity-80 text-center mb-4">
                Please select a user to log in{' '}
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
                <div className="mb-2 font-medium">Connection Error</div>
                <div className="mb-3 text-sm">{error}</div>
                {retryCount < 3 && (
                  <div className="mb-2 text-red-600 text-xs">
                    Auto-retrying... (attempt {retryCount + 1}/3)
                  </div>
                )}
                <Button size="sm" variant="outline" onClick={handleManualRetry} disabled={loading}>
                  Retry Now
                </Button>
              </div>
            )}
            <FormWrapper className="mx-auto w-full">
              <Form {...form}>
                <FluidFormElement
                  onSubmit={form.handleSubmit(handleLogin)}
                  className="flex w-full min-w-64 flex-col items-center gap-4"
                >
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem className="w-full min-w-81">
                        <FormLabel>User</FormLabel>
                        <FormControl>
                          <Select
                            disabled={users.length === 0}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full border-accent/60 bg-zinc-900 text-base">
                              <SelectValue
                                placeholder={
                                  users.length === 0
                                    ? 'No users available'
                                    : `Select User (${users.length} available)`
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto bg-zinc-900">
                              {users.map(({ id, name }) => (
                                <SelectItem key={id} value={id.toString()}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={users.length === 0}>
                    Log in
                  </Button>
                  {users.length === 0 && !loading && !error && (
                    <div className="max-w-md text-center text-gray-500 text-sm">
                      <p>Unable to load user list. This might be a temporary issue.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleManualRetry}
                        className="mt-2"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                </FluidFormElement>
              </Form>
            </FormWrapper>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
