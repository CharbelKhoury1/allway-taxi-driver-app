import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CHANNEL_ID = "dispatch-alert";
const DISPATCH_NOTIFICATION_ID = "dispatch-active";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotifications(): Promise<void> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Dispatch Alerts",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 400, 200, 400, 200, 400],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      enableLights: true,
      lightColor: "#F5B800",
    });
  }

  await Notifications.requestPermissionsAsync();
}

export async function showDispatchNotification(
  customerName: string,
  pickupAddress: string,
): Promise<void> {
  // Cancel any existing dispatch notification first to avoid duplicates
  await Notifications.dismissNotificationAsync(DISPATCH_NOTIFICATION_ID).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: DISPATCH_NOTIFICATION_ID,
    content: {
      title: "New Dispatch Request",
      body: `${customerName} — ${pickupAddress}`,
      sound: "default",
      priority: Notifications.AndroidNotificationPriority.MAX,
      ...(Platform.OS === "android" && {
        channelId: CHANNEL_ID,
        vibrate: [0, 400, 200, 400, 200, 400],
        color: "#F5B800",
        sticky: true,
        autoDismiss: false,
      }),
      data: { type: "dispatch" },
    },
    trigger: null, // show immediately
  });
}

export async function dismissDispatchNotification(): Promise<void> {
  await Notifications.dismissNotificationAsync(DISPATCH_NOTIFICATION_ID).catch(() => {});
}
