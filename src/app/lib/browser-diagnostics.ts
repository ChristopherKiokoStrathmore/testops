/**
 * Browser and environment diagnostics
 * Helps identify why CORS might be failing
 */

export function getBrowserInfo() {
  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const isChrome = /Chrome/i.test(ua) && !/Edge/i.test(ua);
  const isFirefox = /Firefox/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);
  const isEdge = /Edge/i.test(ua);
  
  return {
    userAgent: ua,
    isMobile,
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isInIframe: window.self !== window.top,
    currentOrigin: window.location.origin,
    currentHostname: window.location.hostname,
  };
}

export function checkCORSCapability(verbose = false) {
  const info = getBrowserInfo();
  
  if (verbose) {
    console.group('🔍 Browser Diagnostics');
    console.log('Mobile Device:', info.isMobile ? '✅ Yes' : '❌ No');
    console.log('Browser:', 
      info.isChrome ? 'Chrome' :
      info.isFirefox ? 'Firefox' :
      info.isSafari ? 'Safari' :
      info.isEdge ? 'Edge' :
      'Unknown'
    );
    console.log('In iframe:', info.isInIframe ? '✅ Yes (Figma Make)' : '❌ No');
    console.log('Current origin:', info.currentOrigin);
    console.log('Hostname:', info.currentHostname);
    console.log('CORS Mode:', 'Strict (Desktop browsers enforce strictly)');
    console.groupEnd();
    
    // Mobile browsers are more lenient with CORS
    if (info.isMobile) {
      console.log('💡 Mobile browsers are more lenient with CORS');
    } else {
      console.warn('⚠️ Desktop browsers have strict CORS policies');
      console.log('💡 Solution: Configure Supabase to allow:', info.currentOrigin);
    }
  }
  
  return info;
}

// Don't auto-run - only run when there's an error
// if (import.meta.env.DEV) {
//   checkCORSCapability();
// }

// Expose for console
if (typeof window !== 'undefined') {
  (window as any).checkBrowser = checkCORSCapability;
}
