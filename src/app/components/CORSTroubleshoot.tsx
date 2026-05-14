import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Smartphone, Monitor, Info } from 'lucide-react';

export function CORSTroubleshoot() {
  const [showDetails, setShowDetails] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="glass-effect border border-blue-500/20 rounded-2xl p-6 space-y-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-white font-medium mb-2">
            Why Mobile Works but Desktop Doesn't?
          </h3>
          
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Mobile browsers: Lenient CORS policies ✅</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400">Desktop browsers: Strict CORS policies ⚠️</span>
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-400 hover:text-blue-300 underline text-xs"
            >
              {showDetails ? 'Hide details' : 'Show technical details'}
            </button>

            {showDetails && (
              <div className="mt-4 space-y-3 bg-black/30 rounded-xl p-4 text-xs">
                <div>
                  <p className="text-gray-400 font-medium mb-1">What is CORS?</p>
                  <p className="text-gray-500">
                    Cross-Origin Resource Sharing (CORS) is a security feature in browsers
                    that restricts web pages from making requests to a different domain
                    than the one serving the page.
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 font-medium mb-1">The Problem:</p>
                  <p className="text-gray-500">
                    Your app runs on: <code className="text-yellow-300 bg-black/50 px-1 rounded">
                      {window.location.hostname}
                    </code>
                    <br />
                    But tries to access: <code className="text-yellow-300 bg-black/50 px-1 rounded">
                      mjssawaxbmwjqksyevgd.supabase.co
                    </code>
                    <br /><br />
                    <strong className="text-red-400">Common Issue:</strong> If you see "Redirect is not allowed", 
                    your Supabase project may be <strong>PAUSED</strong>. Check your dashboard!
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 font-medium mb-1">Solutions:</p>
                  <ol className="text-gray-500 space-y-1 ml-4 list-decimal">
                    <li><strong>Check if project is PAUSED</strong> - Go to Supabase Dashboard</li>
                    <li>Configure Supabase to allow Figma domains (see below)</li>
                    <li>Use direct REST API calls (app tries this automatically)</li>
                    <li>Use mobile browser (works around strict policies)</li>
                  </ol>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <p className="text-gray-400 font-medium mb-2">✅ Step 1: Check if Project is Paused</p>
                  <ol className="text-gray-500 space-y-1 ml-4 list-decimal">
                    <li>Go to <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-400 hover:underline">Supabase Dashboard</a></li>
                    <li>Select your project: <code className="text-yellow-300 bg-black/50 px-1 rounded">mjssawaxbmwjqksyevgd</code></li>
                    <li>If you see "Project Paused", click <strong>Resume Project</strong></li>
                    <li>Wait 1-2 minutes for project to fully activate</li>
                  </ol>
                </div>

                <div className="border-t border-white/10 pt-3 mt-3">
                  <p className="text-gray-400 font-medium mb-2">✅ Step 2: Configure CORS (if still failing)</p>
                  <ol className="text-gray-500 space-y-1 ml-4 list-decimal">
                    <li>In Supabase Dashboard → Settings → API</li>
                    <li>Scroll to "CORS Configuration" or "Additional CORS Origins"</li>
                    <li>Add: <code className="text-emerald-300 bg-black/50 px-1 rounded">*</code> (allow all)</li>
                    <li>Or: <code className="text-emerald-300 bg-black/50 px-1 rounded">https://*.figma.site</code></li>
                    <li>Save and wait 1-2 minutes</li>
                  </ol>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-blue-300 text-xs">
                <strong>Current Status:</strong> The app is automatically trying multiple connection methods.
                If login still fails after 3 retries, you may need to configure Supabase CORS settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
