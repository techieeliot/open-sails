'use client';

import { useEffect, useState } from 'react';
import { Clock, LogOut, RefreshCw } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSessionManager } from '@/lib/session-manager';

interface SessionWarningDialogProps {
  isOpen: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  remainingTime?: number;
}

export const SessionWarningDialog = ({
  isOpen,
  onExtendSession,
  onLogout,
  remainingTime = 5 * 60 * 1000, // 5 minutes default
}: SessionWarningDialogProps) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(remainingTime);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, remainingTime, onLogout]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="mx-auto flex max-h-[90vh] w-full max-w-md flex-col bg-zinc-900 text-white border-amber-500">
        <DialogHeader className="text-center pt-6 px-6 pb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-amber-500/20 rounded-full">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-white">
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Your session will expire in {formatTime(timeLeft)} due to inactivity.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Card className="border-amber-500/20 bg-amber-500/10 mb-6">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">{formatTime(timeLeft)}</div>
                <p className="text-sm text-amber-200">Time remaining before automatic logout</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={onExtendSession}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white border-0 transition-colors font-semibold"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Stay Logged In
            </Button>

            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full h-12 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out Now
            </Button>
          </div>

          <p className="text-xs text-slate-400 text-center mt-4">
            Click anywhere outside this dialog or press a key to extend your session automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
