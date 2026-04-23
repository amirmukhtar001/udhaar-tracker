import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem
} from "@react-navigation/drawer";
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

const RootStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MenuButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuButton} accessibilityRole="button">
      <Text style={styles.menuIcon}>☰</Text>
    </TouchableOpacity>
  );
}

function MainStackNavigator() {
  const { t } = useLanguage();

  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: t("screen.home"),
          headerLeft: () => <MenuButton onPress={() => navigation.getParent()?.openDrawer()} />
        })}
      />
      <MainStack.Screen
        name="AddLoan"
        component={AddLoanScreen}
        options={{ title: t("screen.addLoan") }}
      />
      <MainStack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: t("screen.detail") }}
      />
      <MainStack.Screen
        name="EditLoan"
        component={EditLoanScreen}
        options={{ title: t("screen.editLoan") }}
      />
      <MainStack.Screen
        name="AddPayment"
        component={AddPaymentScreen}
        options={{ title: t("screen.addPayment") }}
      />
      <MainStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: t("screen.dashboard") }}
      />
      <MainStack.Screen
        name="Borrowers"
        component={BorrowersScreen}
        options={{ title: t("screen.borrowers") }}
      />
    </MainStack.Navigator>
  );
}

function AppDrawerNavigator() {
  const { t } = useLanguage();
  const { signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(t("auth.logoutTitle"), t("auth.logoutMessage"), [
      { text: t("home.cancel"), style: "cancel" },
      {
        text: t("auth.logoutButton"),
        style: "destructive",
        onPress: async () => {
          const { error } = await signOut();
          if (error) {
            Alert.alert(t("common.error"), error.message || t("auth.logoutError"));
          }
        }
      }
    ]);
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <View style={styles.drawerContentContainer}>
          <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScrollContent}>
            <DrawerItemList {...props} />
          </DrawerContentScrollView>
          <View style={styles.drawerFooter}>
            <DrawerItem
              label={t("auth.logoutButton")}
              labelStyle={styles.drawerLogoutLabel}
              onPress={handleLogout}
            />
          </View>
        </View>
      )}
      screenOptions={{
        drawerPosition: "left"
      }}
    >
      <Drawer.Screen
        name="MainStack"
        component={MainStackNavigator}
        options={{ title: t("screen.home"), headerShown: false }}
      />
      <Drawer.Screen
        name="Legal"
        component={LegalScreen}
        options={{ title: t("screen.legal") }}
      />
    </Drawer.Navigator>
  );
}

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
      <RootStack.Navigator>
        {!hasSelectedLanguage ? (
          <RootStack.Screen
            name="LanguageSelect"
            component={LanguageSelectScreen}
            options={{ headerShown: false }}
          />
        ) : !session ? (
          <RootStack.Screen
            name="PhoneAuth"
            component={PhoneAuthScreen}
            options={{ title: t("screen.phoneAuth"), headerLeft: () => null }}
          />
        ) : (
          <RootStack.Screen
            name="AppDrawer"
            component={AppDrawerNavigator}
            options={{ headerShown: false }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6"
  },
  menuButton: {
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  menuIcon: {
    fontSize: 24,
    color: "#111827"
  },
  drawerContentContainer: {
    flex: 1
  },
  drawerScrollContent: {
    paddingTop: 0
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 6,
    paddingBottom: 16
  },
  drawerLogoutLabel: {
    color: "#b91c1c",
    fontWeight: "700"
  }
});
