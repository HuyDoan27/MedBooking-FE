import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

// Screens
import HomeScreen from "@/components/view/HomeScreen";
import SearchResultsScreen from "@/components/view/SearchResultsScreen";
import AppointmentsScreen from "@/components/view/AppointmentsScreen";
import MedicalRecordsScreen from "@/components/view/MedicalRecordsScreen";
import ProfileScreen from "@/components/view/ProfileScreen";
import LoginScreen from "@/components/view/auth/LoginScreen";
import RegisterScreen from "@/components/view/auth/RegisterScreen";

// Icons
import { Home, Search, Calendar, FileText, User } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Screen = "home" | "search" | "appointments" | "records" | "profile";

export default function Page() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleAuthSuccess = async (data: any) => {
    if (data?.token) {
      await AsyncStorage.setItem("token", data.token);
    }
    setIsLoggedIn(true);
  };

  const renderScreen = () => {
    if (!isLoggedIn) {
      return authMode === "login" ? (
        <LoginScreen
          onSwitchToRegister={() => setAuthMode("register")}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <RegisterScreen
          onSwitchToLogin={() => setAuthMode("login")}
          onRegisterSuccess={handleLoginSuccess}
        />
      );
    }

    switch (currentScreen) {
      case "home":
        return <HomeScreen />;
      case "search":
        return <SearchResultsScreen />;
      case "appointments":
        return <AppointmentsScreen />;
      case "records":
        return <MedicalRecordsScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const tabs = [
    { id: "home" as Screen, label: "Trang chủ", icon: Home },
    { id: "search" as Screen, label: "Tìm kiếm", icon: Search },
    { id: "appointments" as Screen, label: "Lịch hẹn", icon: Calendar },
    { id: "records" as Screen, label: "Hồ sơ", icon: FileText },
    { id: "profile" as Screen, label: "Cá nhân", icon: User },
  ];

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setIsLoggedIn(true);
      }
    };
    checkToken();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Content */}
      <View style={styles.main}>{renderScreen()}</View>

      {/* Bottom Navigation chỉ hiện khi đã login */}
      {isLoggedIn && (
        <View style={styles.bottomNav}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentScreen === tab.id;

            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setCurrentScreen(tab.id)}
                style={[styles.tabButton, isActive && styles.tabActive]}
              >
                <Icon size={22} color={isActive ? "#0891b2" : "#6b7280"} />
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb", // bg-gray-50
  },
  main: {
    flex: 1,
    paddingBottom: 60, // chừa chỗ cho bottom nav
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#ecfeff", // bg-cyan-50
  },
  tabLabel: {
    fontSize: 12,
    color: "#6b7280", // text-gray-500
    marginTop: 2,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#0891b2", // text-cyan-600
  },
});
