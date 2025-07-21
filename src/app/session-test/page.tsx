import PageWrapper from '@/components/page-wrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Session Test - Open Sails',
  description: 'Test page for session management functionality',
};

export default function SessionTestPage() {
  return (
    <PageWrapper>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Session Management Test</h1>
          <p className="text-slate-400">
            This page demonstrates the 45-minute session timeout with warning dialog
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-6">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              🔐 Session Management Features
            </h2>
            <ul className="space-y-2 text-amber-200">
              <li>• Session automatically expires after 45 minutes of inactivity</li>
              <li>• Warning dialog appears at 40 minutes (5 minutes before expiration)</li>
              <li>• Session persists across page reloads using sessionStorage</li>
              <li>• Activity detection resets the timer automatically</li>
              <li>• Cross-tab session synchronization</li>
            </ul>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Testing Instructions</h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="font-medium text-white mb-2">To test session timeout:</h3>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Log in to the application</li>
                  <li>Remain idle for 40+ minutes to see the warning dialog</li>
                  <li>Or check browser sessionStorage to see session data</li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium text-white mb-2">To test session persistence:</h3>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Log in to the application</li>
                  <li>Reload the page or navigate between pages</li>
                  <li>Your session should persist automatically</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-6">
            <h2 className="text-xl font-semibold text-emerald-400 mb-4">
              ✅ Implementation Complete
            </h2>
            <div className="space-y-2 text-emerald-200">
              <p>The session management system is now fully implemented with:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>react-idle-timer library for activity detection</li>
                <li>SessionProvider component wrapping the entire app</li>
                <li>SessionWarningDialog with countdown and extend/logout options</li>
                <li>SessionRestorer for automatic session recovery on page load</li>
                <li>Integration with existing Jotai state management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
