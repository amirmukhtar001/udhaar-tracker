import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import AddLoanScreen from "../screens/AddLoanScreen";
import DetailScreen from "../screens/DetailScreen";
import EditLoanScreen from "../screens/EditLoanScreen";
import AddPaymentScreen from "../screens/AddPaymentScreen";
import DashboardScreen from "../screens/DashboardScreen";
import BorrowersScreen from "../screens/BorrowersScreen";
import LegalScreen from "../screens/LegalScreen";
import LanguageSelectScreen from "../screens/LanguageSelectScreen";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import PhoneAuthScreen from "../screens/PhoneAuthScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { hasSelectedLanguage, isLanguageReady, t } = useLanguage();
  const { session, isAuthReady } = useAuth();

  if (!isLanguageReady || !isAuthReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!hasSelectedLanguage ? (
          <Stack.Screen
            name="LanguageSelect"
            component={LanguageSelectScreen}
            options={{ headerShown: false }}
          />
        ) : !session ? (
          <Stack.Screen
            name="PhoneAuth"
            component={PhoneAuthScreen}
            options={{ title: t("screen.phoneAuth"), headerLeft: () => null }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: t("screen.home"), headerLeft: () => null }}
            />
            <Stack.Screen
              name="AddLoan"
              component={AddLoanScreen}
              options={{ title: t("screen.addLoan") }}
            />
            <Stack.Screen
              name="Detail"
              component={DetailScreen}
              options={{ title: t("screen.detail") }}
            />
            <Stack.Screen
              name="EditLoan"
              component={EditLoanScreen}
              options={{ title: t("screen.editLoan") }}
            />
            <Stack.Screen
              name="AddPayment"
              component={AddPaymentScreen}
              options={{ title: t("screen.addPayment") }}
            />
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: t("screen.dashboard") }}
            />
            <Stack.Screen
              name="Borrowers"
              component={BorrowersScreen}
              options={{ title: t("screen.borrowers") }}
            />
            <Stack.Screen
              name="Legal"
              component={LegalScreen}
              options={{ title: t("screen.legal") }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6"
  }
});
