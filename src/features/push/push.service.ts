/**
 * Utility for sending Push Notifications via Firebase Admin SDK or other providers.
 * Note: Requires server environment (Node).
 */
export async function sendPushNotification({ tokens, title, body, data }: { tokens: string[]; title: string; body: string; data?: Record<string, string> }) {
  if (!tokens || tokens.length === 0) return;

  const fcmServerKey = process.env.FCM_SERVER_KEY;
  if (!fcmServerKey) {
    console.warn("[Push] Missing FCM_SERVER_KEY. Skipping push notification:", { title, body, tokensCount: tokens.length });
    return;
  }

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${fcmServerKey}`,
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: {
          title,
          body,
          sound: "default"
        },
        data: data || {}
      }),
    });

    if (!response.ok) {
      console.error("[Push] FCM request failed:", await response.text());
    }
  } catch (error) {
    console.error("[Push] Error sending push notification:", error);
  }
}
