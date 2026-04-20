import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import AddLoanScreen from "../screens/AddLoanScreen";
import DetailScreen from "../screens/DetailScreen";
import EditLoanScreen from "../screens/EditLoanScreen";
import AddPaymentScreen from "../screens/AddPaymentScreen";
import DashboardScreen from "../screens/DashboardScreen";
import BorrowersScreen from "../screens/BorrowersScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Udhaar Tracker" }}
        />
        <Stack.Screen
          name="AddLoan"
          component={AddLoanScreen}
          options={{ title: "Add Loan" }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: "Loan Detail" }}
        />
        <Stack.Screen
          name="EditLoan"
          component={EditLoanScreen}
          options={{ title: "Edit Loan" }}
        />
        <Stack.Screen
          name="AddPayment"
          component={AddPaymentScreen}
          options={{ title: "Add Payment" }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: "Dashboard" }}
        />
        <Stack.Screen
          name="Borrowers"
          component={BorrowersScreen}
          options={{ title: "Borrowers" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
