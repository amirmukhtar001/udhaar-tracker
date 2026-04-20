import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";
import { setupNotifications } from "./src/utils/notification";
import { LanguageProvider } from "./src/context/LanguageContext";

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <LanguageProvider>
        <AppNavigator />
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
