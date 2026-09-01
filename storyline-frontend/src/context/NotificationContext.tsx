import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { messaging, getToken, onMessage, firebaseConfig } from '../firebase';
import { notificationsApi } from '../api/client';

interface NotificationContextType {
  triggerNotification: (title: string, message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  initFirebaseMessaging: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{title: string, message: string, type: string} | null>(null);

  // A simple beep sound using standard web audio API to avoid needing assets
  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    } catch (e) {
      console.warn("Audio not supported or blocked");
    }
  };

  const initFirebaseMessaging = async () => {
    // Only init if logged in, otherwise backend returns 403 when saving token
    if (!localStorage.getItem('accessToken')) {
      return;
    }

    try {
      if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker) {
        // Register SW with config injected in URL
        const swUrl = `/firebase-messaging-sw.js?config=${encodeURIComponent(JSON.stringify(firebaseConfig))}`;
        const registration = await navigator.serviceWorker.register(swUrl);
        
        // getToken using our custom registration
        const actualToken = await getToken(messaging, { 
          serviceWorkerRegistration: registration
        });
        
        if (actualToken) {
           console.log("FCM Token:", actualToken);
           try {
             await notificationsApi.registerDeviceToken(actualToken);
           } catch(apiError) {
             console.warn("Failed to save FCM token to backend:", apiError);
           }
        }
      }
    } catch(e) {
      console.error("Failed to init FCM:", e);
    }
  };

  // Ask for notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        if (localStorage.getItem('accessToken')) {
           initFirebaseMessaging();
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted' && localStorage.getItem('accessToken')) {
             initFirebaseMessaging();
          }
        });
      }
    }

    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        const title = payload.data?.title || 'New Notification';
        const body = payload.data?.body || '';
        const type = (payload.data?.type as any) || 'info';
        triggerNotification(title, body, type);
      });
      return () => unsubscribe();
    }
  }, []);

  const triggerNotification = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    // 1. Play sound
    playBeep();
    
    // 2. Trigger vibration if on a supported device (mobile)
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    // 3. System Notification (Mobile notification bar)
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { 
          body: message,
          vibrate: [200, 100, 200]
        } as any);
      } catch (e) {
        console.warn("System notification failed", e);
      }
    }

    // 4. Show Toast UI
    setToast({ title, message, type });
    
    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  return (
    <NotificationContext.Provider value={{ triggerNotification, initFirebaseMessaging }}>
      {children}
      
      {/* Toast UI */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#f59e0b' : toast.type === 'success' ? '#10b981' : '#3b82f6',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          maxWidth: '350px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{toast.title}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{toast.message}</div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
