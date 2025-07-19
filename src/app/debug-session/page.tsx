import PageWrapper from '@/components/page-wrapper';
import { Metadata } from 'next';
import { InfoCard } from '@/components/info-card';

export const metadata: Metadata = {
  title: 'Debug Session - Open Sails',
  description: 'Debug session state across tabs',
};

export default function DebugSessionPage() {
  return (
    <PageWrapper>
      {/* <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Session Debug Page</h1>
          <p className="text-slate-400">Use this page to debug session state across browser tabs</p>
        </div>

        <div className="space-y-6">
          <InfoCard title="🔧 Debugging Instructions" color="blue">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-white mb-2">To test cross-tab sessions:</h3>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Log in to the application in one tab</li>
                  <li>Copy this page URL and open it in a new tab</li>
                  <li>Open browser DevTools console in both tabs</li>
                  <li>
                    Run <code className="bg-slate-700 px-2 py-1 rounded">debugSession()</code> in
                    console
                  </li>
                  <li>Check if session state is consistent across tabs</li>
                </ol>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Console Commands:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <code className="bg-slate-700 px-2 py-1 rounded">debugSession()</code> - Show
                    complete session state
                  </li>
                  <li>
                    <code className="bg-slate-700 px-2 py-1 rounded">
                      localStorage.getItem('user_session')
                    </code>{' '}
                    - Raw session data
                  </li>
                </ul>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="⚠️ Expected Behavior" color="yellow">
            <div className="space-y-2">
              <p>When you open this page in a new tab while logged in:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>You should see "Restoring session for user: [username]" in console</li>
                <li>
                  You should see "Activating session manager - valid session found" in console
                </li>
                <li>The header should show you as logged in</li>
                <li>Navigation should work normally</li>
                <li>Session timer should be active and synchronized</li>
              </ul>
            </div>
          </InfoCard>

          <InfoCard title="📋 Current Page State" color="slate">
            <div className="text-slate-300">
              <p>This page will automatically restore your session if you're logged in.</p>
              <p className="mt-2">Check the browser console for session restoration logs.</p>
            </div>
          </InfoCard>
        </div>
      </div> */}
      debug
    </PageWrapper>
  );
}
