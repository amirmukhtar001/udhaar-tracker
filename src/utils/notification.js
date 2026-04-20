import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export async function setupNotifications() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("loan-reminders", {
      name: "Loan Reminders",
      importance: Notifications.AndroidImportance.HIGH
    });
  }
}

export async function scheduleLoanReminder(loan) {
  if (!loan?.reminderDate) return null;

  const triggerDate = new Date(loan.reminderDate);
  if (Number.isNaN(triggerDate.getTime())) {
    return null;
  }

  const reminderRepeat = loan.reminderRepeat || "NONE";
  let trigger = triggerDate;

  if (reminderRepeat === "NONE") {
    if (triggerDate <= new Date()) {
      return null;
    }
  } else if (reminderRepeat === "DAILY") {
    trigger = {
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      repeats: true
    };
  } else if (reminderRepeat === "WEEKLY") {
    trigger = {
      weekday: triggerDate.getDay() + 1,
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      repeats: true
    };
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Udhaar Reminder",
      body: `${loan.name} owes you Rs. ${loan.amount}`
    },
    trigger
  });

  return id;
}

export async function cancelLoanReminder(notificationId) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
