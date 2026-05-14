/**
 * Comprehensive diagnostics for troubleshooting connection issues
 */

import { healthCheck } from './health-check';
import { getBrowserInfo } from './browser-diagnostics';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function runFullDiagnostics() {
  console.group('🔍 FULL SYSTEM DIAGNOSTICS');
  
  // 1. Browser Info
  console.group('1️⃣ Browser Information');
  const browserInfo = getBrowserInfo();
  console.table({
    'Device Type': browserInfo.isMobile ? 'Mobile' : 'Desktop',
    'Browser': browserInfo.isChrome ? 'Chrome' : browserInfo.isFirefox ? 'Firefox' : browserInfo.isSafari ? 'Safari' : 'Other',
    'In Iframe': browserInfo.isInIframe ? 'Yes (Figma Make)' : 'No',
    'Origin': browserInfo.currentOrigin,
    'Hostname': browserInfo.currentHostname,
  });
  console.groupEnd();

  // 2. Network connectivity
  console.group('2️⃣ Network Connectivity');
  console.log('Online status:', navigator.onLine ? '✅ Online' : '❌ Offline');
  console.log('Connection type:', (navigator as any).connection?.effectiveType || 'Unknown');
  console.groupEnd();

  // 3. Supabase URL reachability
  console.group('3️⃣ Supabase URL Reachability');
  try {
    const startTime = Date.now();
    const response = await fetch(SUPABASE_URL, {
      method: 'HEAD',
      mode: 'no-cors', // Bypass CORS for basic reachability
      signal: AbortSignal.timeout(5000)
    });
    const latency = Date.now() - startTime;
    console.log('✅ Base URL is reachable');
    console.log(`⏱️ Latency: ${latency}ms`);
  } catch (err: any) {
    console.error('❌ Cannot reach base URL:', err.message);
  }
  console.groupEnd();

  // 4. REST API Health Check
  console.group('4️⃣ REST API Health Check');
  const health = await healthCheck();
  if (health.success) {
    console.log('✅ REST API is responding');
    console.log(`⏱️ Latency: ${health.latency}ms`);
  } else {
    console.error('❌ REST API check failed');
    console.error('Message:', health.message);
    console.error('Details:', health.details);
  }
  console.groupEnd();

  // 5. CORS Check
  console.group('5️⃣ CORS Check');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
      },
      mode: 'cors',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok || response.status === 200) {
      console.log('✅ CORS is properly configured');
    } else if (response.status === 0) {
      console.warn('⚠️ CORS might be blocking (status 0)');
    } else {
      console.warn(`⚠️ Unexpected status: ${response.status}`);
    }
  } catch (err: any) {
    if (err.message?.includes('CORS')) {
      console.error('❌ CORS error detected');
      console.error('Fix: Add your origin to Supabase allowed origins');
    } else if (err.message?.includes('Failed to fetch')) {
      console.error('❌ Fetch failed - project might be paused');
    } else {
      console.error('❌ CORS check failed:', err.message);
    }
  }
  console.groupEnd();

  // 6. Project Status
  console.group('6️⃣ Project Status Check');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: { 'apikey': SUPABASE_KEY },
      redirect: 'manual',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.type === 'opaqueredirect' || 
        response.status === 301 || 
        response.status === 302 || 
        response.status === 307 || 
        response.status === 308) {
      console.error('❌ PROJECT IS PAUSED!');
      const projectId = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? 'your-project-id';
      console.error(`Fix: Go to https://supabase.com/dashboard/project/${projectId}`);
      console.error('Click "Resume" or "Restore" and wait 2-3 minutes');
    } else {
      console.log('✅ Project appears to be active');
    }
  } catch (err: any) {
    console.error('⚠️ Could not check project status:', err.message);
  }
  console.groupEnd();

  // 7. Summary
  console.group('7️⃣ Summary');
  if (health.success && navigator.onLine) {
    console.log('✅ Everything looks good! You should be able to log in.');
  } else if (!navigator.onLine) {
    console.error('❌ You are offline. Check your internet connection.');
  } else if (!health.success) {
    console.error('❌ Supabase connection issues detected.');
    console.error('Most likely cause: Project is PAUSED');
    console.error('Solution: Resume project at https://supabase.com/dashboard');
  }
  console.groupEnd();

  console.groupEnd();

  return {
    browser: browserInfo,
    online: navigator.onLine,
    healthCheck: health,
  };
}

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).runDiagnostics = runFullDiagnostics;
  
  // Only show tip once
  if (!(window as any).__diagnosticsTipShown) {
    console.log('\n%c🔧 Troubleshooting Tools Available!', 'color: #10b981; font-size: 14px; font-weight: bold;');
    console.log('%cRun these commands in console:', 'color: #60a5fa; font-size: 12px;');
    console.log('%c  window.runDiagnostics()%c - Full system diagnostics', 'color: #fbbf24; font-family: monospace;', 'color: #9ca3af;');
    console.log('%c  window.testSupabaseHealth()%c - Quick health check', 'color: #fbbf24; font-family: monospace;', 'color: #9ca3af;');
    console.log('\n%c💡 Works on another computer but not this one?', 'color: #f59e0b; font-size: 13px; font-weight: bold;');
    console.log('%c  1. Right-click refresh button → "Empty Cache and Hard Reload"', 'color: #9ca3af; font-size: 11px;');
    console.log('%c  2. Try Incognito mode (Ctrl+Shift+N)', 'color: #9ca3af; font-size: 11px;');
    console.log('%c  3. Disable browser extensions', 'color: #9ca3af; font-size: 11px;');
    console.log('\n%c📖 See /BROWSER_CACHE_FIX.md for step-by-step guide', 'color: #60a5fa; font-size: 11px;');
    (window as any).__diagnosticsTipShown = true;
  }
}
