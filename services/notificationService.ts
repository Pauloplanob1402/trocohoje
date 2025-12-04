// Service to handle OneSignal Push Notifications

// NOTE: Replace this with your actual OneSignal App ID from onesignal.com
const ONESIGNAL_APP_ID = "YOUR-ONESIGNAL-APP-ID-HERE"; 

export const initOneSignal = async () => {
  if (typeof window === 'undefined') return;

  // Initialize the defer queue if it doesn't exist
  window.OneSignalDefer = window.OneSignalDefer || [];
  
  window.OneSignalDefer.push(async function(OneSignal: any) {
    try {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        safari_web_id: "web.onesignal.auto.simulated", // Optional safari ID
        notifyButton: {
          enable: false, // We will use our own UI in the header
        },
        allowLocalhostAsSecureOrigin: true, // Helpful for testing
      });
      console.log("OneSignal initialized");
    } catch (error) {
      console.warn("OneSignal init failed (likely missing valid App ID):", error);
    }
  });
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!window.OneSignal) {
    console.warn("OneSignal not loaded yet");
    return false;
  }

  try {
    // Show the native browser prompt
    await window.OneSignal.Slidedown.promptPush();
    // Alternatively, just generic request:
    // await window.OneSignal.login(userId); // If you want to link to user ID later
    return true;
  } catch (e) {
    console.error("Error requesting permission:", e);
    return false;
  }
};

export const checkPermission = async (): Promise<boolean> => {
    // Safety check: ensure window.OneSignal AND window.OneSignal.Notifications exist
    if (!window.OneSignal || !window.OneSignal.Notifications) return false;
    try {
        const permission = await window.OneSignal.Notifications.permission;
        return permission;
    } catch (e) {
        return false;
    }
};