'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { User } from '@/types';
import { useSetAtom } from 'jotai';
import { userSessionAtom } from '@/lib/atoms';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { formSchema } from './schema';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Bitcoin } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const LoginForm = () => {
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
      setUserSession({ user, loginTimestamp: new Date().toISOString() });
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-w-64">
      <Card className="w-full max-w-md shadow-lg flex flex-col justify-center">
        <CardHeader className="text-center">
          <CardTitle>Login</CardTitle>
          <p className="text-muted-foreground text-sm">
            Please select a user to log in and continue
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 w-full">
          {error && (
            <div className="p-4 border border-red-300 rounded-lg bg-red-50 text-red-700 mb-4">
              <div className="font-medium mb-2">Connection Error</div>
              <div className="text-sm mb-3">{error}</div>
              {retryCount < 3 && (
                <div className="text-xs text-red-600 mb-2">
                  Auto-retrying... (attempt {retryCount + 1}/3)
                </div>
              )}
              <Button size="sm" variant="outline" onClick={handleManualRetry} disabled={loading}>
                Retry Now
              </Button>
            </div>
          )}
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="text-gray-600">
                <Bitcoin className="animate-pulse" height={88} width={88} />
              </div>
              {retryCount > 0 && (
                <div className="text-sm text-gray-500">Retry attempt {retryCount}/3</div>
              )}
            </div>
          ) : (
            <FormWrapper className="flex flex-col items-center gap-2 w-full">
              <Form {...form}>
                <FluidFormElement
                  onSubmit={form.handleSubmit(handleLogin)}
                  className="flex flex-col items-center gap-4 w-full min-w-81"
                >
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>User</FormLabel>
                        <FormControl>
                          <Select
                            disabled={users.length === 0}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full text-base border-accent/60 bg-zinc-900">
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
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full"
                    disabled={users.length === 0}
                  >
                    Log in
                  </Button>
                  {users.length === 0 && !loading && !error && (
                    <div className="text-sm text-gray-500 text-center max-w-md">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
