// デバッグユーティリティ関数

export const getGoogleMapsErrorInfo = () => {
  try {
    const errorInfo = localStorage.getItem('googleMapsError');
    return errorInfo ? JSON.parse(errorInfo) : null;
  } catch (e) {
    console.warn('Could not retrieve error info from localStorage:', e);
    return null;
  }
};

export const clearGoogleMapsErrorInfo = () => {
  try {
    localStorage.removeItem('googleMapsError');
    console.log('Google Maps error info cleared');
  } catch (e) {
    console.warn('Could not clear error info from localStorage:', e);
  }
};

export const logSystemInfo = () => {
  const systemInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    url: window.location.href,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  };
  
  console.group('🔍 System Information');
  Object.entries(systemInfo).forEach(([key, value]) => {
    console.log(`${key}:`, value);
  });
  console.groupEnd();
  
  return systemInfo;
};

export const logGoogleMapsStatus = () => {
  const status = {
    googleMapsLoaded: !!(window.google && window.google.maps),
    googleMapsVersion: window.google?.maps?.version || 'N/A',
    leafletAvailable: typeof window.L !== 'undefined',
    storedErrors: getGoogleMapsErrorInfo()
  };
  
  console.group('🗺️ Maps Status');
  Object.entries(status).forEach(([key, value]) => {
    console.log(`${key}:`, value);
  });
  console.groupEnd();
  
  return status;
};

// コンソールコマンド用のグローバル関数を設定
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.debugMaps = {
    getErrorInfo: getGoogleMapsErrorInfo,
    clearErrorInfo: clearGoogleMapsErrorInfo,
    logSystemInfo,
    logMapsStatus: logGoogleMapsStatus,
    help: () => {
      console.log(`
🔧 Debug Commands:
- debugMaps.getErrorInfo() - Get stored error information
- debugMaps.clearErrorInfo() - Clear stored error information
- debugMaps.logSystemInfo() - Log system information
- debugMaps.logMapsStatus() - Log maps status
- debugMaps.help() - Show this help
      `);
    }
  };
  
  console.log('🔧 Debug utilities loaded. Type "debugMaps.help()" for available commands.');
}