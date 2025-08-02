import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./screens/HomeScreen";
import MainScreen from "./screens/MainScreen";
import ComplaintScreen from "./screens/ComplaintScreen";
import LoginScreen from "./screens/LoginScreen"; 
import SignupScreen from "./screens/SignupScreen"; // Add this line
import ComplaintHistoryScreen from "./screens/ComplaintHistoryScreen";
import { SafeAreaView } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ComplaintHistory" component={ComplaintHistoryScreen} />
            
            <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Complaint" component={ComplaintScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
