import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function CORSDesktopFix() {
  const [testingCORS, setTestingCORS] = useState(false);
  const [corsResult, setCorsResult] = useState<{
    directFetch: boolean;
    simpleGET: boolean;
    withPreflight: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const figmaSiteOrigin = window.location.origin;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const testCORS = async () => {
    setTestingCORS(true);
    const results = {
      directFetch: false,
      simpleGET: false,
      withPreflight: false,
    };

    try {
      // Test 1: Direct fetch with no custom headers (no preflight)
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
        });
        results.directFetch = response.ok || response.status === 401;
      } catch (e) {
        results.directFetch = false;
      }

      // Test 2: Simple GET with minimal headers
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id&limit=1`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
          },
        });
        results.simpleGET = response.ok || response.status === 401;
      } catch (e) {
        results.simpleGET = false;
      }

      // Test 3: With custom headers that trigger preflight
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id&limit=1`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
        });
        results.withPreflight = response.ok || response.status === 401;
      } catch (e) {
        results.withPreflight = false;
      }
    } catch (error) {
      console.error('CORS test error:', error);
    }

    setCorsResult(results);
    setTestingCORS(false);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/auth/url-configuration', '_blank');
  };

  return (
    <Card className="bg-gray-900/50 border-yellow-500/30 p-6 space-y-6">
      {/* Maintenance Warning */}
      <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4 animate-pulse">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <h4 className="text-base font-bold text-red-300 mb-2">⚠️ Supabase Maintenance Detected</h4>
            <p className="text-sm text-gray-300 leading-relaxed mb-2">
              If Supabase is under maintenance (check the banner in your Supabase dashboard), 
              the connection errors are <span className="text-yellow-300 font-semibold">temporary</span> and will resolve automatically.
            </p>
            <p className="text-sm text-red-300 font-semibold">
              ➜ Wait for maintenance to complete before making CORS changes!
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="p-3 bg-yellow-500/20 rounded-xl">
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            Desktop Browser CORS Issue Detected
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your Supabase project is returning redirects during CORS preflight checks, 
            which desktop browsers block more strictly than mobile browsers.
          </p>
        </div>
      </div>

      {/* Primary Action - Open Supabase Settings */}
      <div className="space-y-3">
        <Button
          onClick={openSupabaseDashboard}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-6 text-base font-semibold shadow-lg shadow-emerald-500/25"
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          Open Supabase URL Configuration
        </Button>
        <p className="text-xs text-center text-gray-400">
          ↑ Opens: Authentication → URL Configuration (where CORS/redirect URLs are managed)
        </p>
      </div>

      {/* Test CORS Button */}
      <div className="flex gap-3">
        <Button
          onClick={testCORS}
          disabled={testingCORS}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {testingCORS ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run CORS Diagnostic
            </>
          )}
        </Button>
      </div>

      {/* Test Results */}
      {corsResult && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-sm font-medium text-gray-300">Diagnostic Results:</div>
          
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${
            corsResult.directFetch 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            {corsResult.directFetch ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <div>
              <div className="text-sm font-medium text-white">Direct Connection</div>
              <div className="text-xs text-gray-400">Basic connectivity test</div>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg border ${
            corsResult.simpleGET 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            {corsResult.simpleGET ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <div>
              <div className="text-sm font-medium text-white">Simple API Request</div>
              <div className="text-xs text-gray-400">GET request with API key</div>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg border ${
            corsResult.withPreflight 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            {corsResult.withPreflight ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <div>
              <div className="text-sm font-medium text-white">CORS Preflight</div>
              <div className="text-xs text-gray-400">Complex request with custom headers</div>
            </div>
          </div>
        </div>
      )}

      {/* Fix Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-3">
        <div className="text-sm font-semibold text-blue-300">🔧 Step-by-Step Fix (AFTER maintenance completes):</div>
        
        <ol className="space-y-3 text-xs text-gray-300 list-decimal list-inside">
          <li className="leading-relaxed">
            <span className="font-semibold text-white">Wait for Supabase maintenance to complete</span>
            <div className="mt-1 text-yellow-400 ml-5">
              Check your Supabase dashboard for the maintenance banner. When it's gone, proceed to step 2.
            </div>
          </li>
          <li className="leading-relaxed">
            <span className="font-semibold text-white">Click the green button above</span> to open URL Configuration
            <div className="mt-1 text-gray-400 ml-5">
              Or manually: <span className="text-blue-400 font-mono">Dashboard → Authentication → URL Configuration</span>
            </div>
          </li>
          <li className="leading-relaxed">
            <span className="font-semibold text-white">Find the section</span> labeled:
            <div className="mt-1 ml-5 space-y-1">
              <div className="text-yellow-400">• "Redirect URLs"</div>
              <div className="text-yellow-400">• "Site URL" / "Additional Redirect URLs"</div>
              <div className="text-yellow-400">• Or similar URL allowlist</div>
            </div>
          </li>
          <li className="leading-relaxed">
            <span className="font-semibold text-white">Copy and add</span> this URL to the allowed list:
            <div className="mt-2 flex items-center gap-2 bg-black/50 rounded p-2 font-mono text-emerald-400">
              <code className="flex-1 text-xs break-all">{figmaSiteOrigin}</code>
              <button
                onClick={() => copyToClipboard(figmaSiteOrigin)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </li>
          <li className="leading-relaxed">
            <span className="font-semibold text-white">Click Save</span> and wait 
            <span className="text-yellow-400 font-semibold"> 2-3 minutes</span> for changes to propagate
          </li>
          <li className="leading-relaxed">
            <span className="font-semibold text-white">Hard refresh</span> this page: Press 
            <span className="text-blue-400 font-mono"> Ctrl+Shift+R</span> (Windows) or 
            <span className="text-blue-400 font-mono"> Cmd+Shift+R</span> (Mac)
          </li>
        </ol>
      </div>

      {/* Alternative: Check RLS */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 space-y-2">
        <div className="text-sm font-semibold text-yellow-300">⚠️ Also Check:</div>
        <ul className="space-y-1 text-xs text-gray-300 list-disc list-inside">
          <li>Verify your Supabase project is <span className="text-emerald-400 font-semibold">ACTIVE</span> (not paused)</li>
          <li>Confirm Row Level Security (RLS) policies allow <span className="text-blue-400 font-mono">anon</span> role access</li>
          <li>Check if API keys are valid and not expired</li>
          <li>Try disabling browser extensions (ad blockers, privacy tools)</li>
        </ul>
      </div>

      {/* Documentation Link */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
        <p className="text-xs text-gray-500">
          For detailed troubleshooting steps
        </p>
        <button
          onClick={() => {
            const docElement = document.getElementById('cors-fix-docs');
            if (docElement) {
              docElement.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          View Full Guide →
        </button>
      </div>
    </Card>
  );
}
