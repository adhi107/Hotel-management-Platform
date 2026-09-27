/**
 * Mobile Haptics Utility
 * Provides native-feeling micro-vibration feedback for mobile/PWA users.
 * Gracefully falls back to no-op on unsupported desktop/browser environments.
 */

export type HapticType = 'selection' | 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy';

export const haptic = (type: HapticType = 'selection'): void => {
  if (typeof window === 'undefined' || !('navigator' in window) || !navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'selection':
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(45);
        break;
      case 'success':
        // Double-pulse for success confirmation
        navigator.vibrate([15, 40, 25]);
        break;
      case 'warning':
        navigator.vibrate([30, 50, 30]);
        break;
      case 'error':
        // Triple-pulse for error rejection
        navigator.vibrate([40, 40, 40, 40, 60]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch (e) {
    // Silently ignore if browser blocks vibration without user interaction
  }
};
