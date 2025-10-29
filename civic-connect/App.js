import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Screens
import HomeScreen from "./screens/HomeScreen";
import MainScreen from "./screens/MainScreen";
import ComplaintScreen from "./screens/ComplaintScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import ComplaintHistoryScreen from "./screens/ComplaintHistoryScreen";
import AdminDashboardScreen from "./screens/AdminDashboardScreen";
import ChatBotScreen from "./screens/ChatBotScreen"; 
import PlaceholderScreen from "./screens/PlaceholderScreen"; 
import AdminDashboardChartScreen from './screens/AdminDashboardChartScreen';
import AdminWardInsightsScreen from "./screens/AdminWardInsightsScreen";
import WardInsightsScreen from "./screens/WardInsightsScreen";
import FutureInsightsScreen from "./screens/FutureInsightsScreen";
import AdminAlertScreen from "./screens/AdminAlertScreen";
import ManageAlertsScreen from "./screens/ManageAlertsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs for regular users
function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Main"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Main") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Chatbot") iconName = focused ? "chatbubble" : "chatbubble-outline";
          else iconName = focused ? "apps" : "apps-outline";
          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: "#1672ce",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { height: 60, paddingBottom: 5, paddingTop: 5 },
      })}
    >
      <Tab.Screen name="Main" component={MainScreen} />
      <Tab.Screen name="Chatbot" component={ChatBotScreen} />
      <Tab.Screen name="RightTab" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            {/* Auth Stack */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />

            {/* App Stack with Bottom Tabs */}
            <Stack.Screen name="AppHome" component={BottomTabs} options={{ gestureEnabled: false }} />

            {/* Shared Screens (accessible from everywhere) */}
            <Stack.Screen name="Complaint" component={ComplaintScreen} />
            <Stack.Screen name="ComplaintHistory" component={ComplaintHistoryScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Main" component={MainScreen} />

            {/* Admin Screens */}
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminDashboardCharts" component={AdminDashboardChartScreen} />
            <Stack.Screen name="AdminWardInsights" component={AdminWardInsightsScreen} />
            <Stack.Screen name="WardInsights" component={WardInsightsScreen} />
            <Stack.Screen name="FutureInsights" component={FutureInsightsScreen} />
            <Stack.Screen name="AdminAlert" component={AdminAlertScreen} />
            <Stack.Screen name="ManageAlerts" component={ManageAlertsScreen} />

          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}