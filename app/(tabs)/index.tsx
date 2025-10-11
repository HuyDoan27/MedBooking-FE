import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

// User
import HomeScreen from "@/components/view/User/HomeScreen";
import SearchResultsScreen from "@/components/view/User/SearchResultsScreen";
import AppointmentsScreen from "@/components/view/User/AppointmentsScreen";
import MedicalRecordsScreen from "@/components/view/User/MedicalRecordsScreen";
import ProfileScreen from "@/components/view/User/ProfileScreen";
import LoginScreen from "@/components/view/auth/LoginScreen";

//Doctor
import DoctorHomeScreen from "@/components/view/Doctor/DoctorHomeScreen";
import DoctorScheduleScreen from "@/components/view/Doctor/DoctorScheduleScreen";

//Admin
import AdminDashboardScreen from "@/components/view/Admin/AdminDashboardScreen";
import AdminClinicsScreen from "@/components/view/Admin/AdminClinicsScreen";
import AdminDoctorsScreen from "@/components/view/Admin/AdminDoctorsScreen";

// Icons
import { Home, Search, Calendar, FileText, User } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RegisterContainer from "@/components/view/auth/RegisterContainer";

type Screen =
  | "home"
  | "search"
  | "appointments"
  | "records"
  | "profile"
  | "clinicManager"
  | "doctorManager"
  | "userManager";

export default function Page() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"user" | "doctor" | "admin" | null>(null);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // const handleAuthSuccess = async (data: any) => {
  //   if (data?.token) {
  //     await AsyncStorage.setItem("token", data.token);
  //   }
  //   if (data?.role) {
  //     await AsyncStorage.setItem("role", data.role);
  //   }
  //   setIsLoggedIn(true);
  // };

  const renderScreen = () => {
    if (!isLoggedIn) {
      return authMode === "login" ? (
        <LoginScreen
          onSwitchToRegister={() => setAuthMode("register")}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <RegisterContainer onSwitchToLogin={() => setAuthMode("login")} />
      );
    }

    if (role === "user") {
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
    }

    if (role === "doctor") {
      switch (currentScreen) {
        case "home":
          return <DoctorHomeScreen />;
        case "appointments":
          return <DoctorScheduleScreen />;
        case "profile":
          return <ProfileScreen />;
        default:
          return <HomeScreen />;
      }
    }

    if (role === "admin") {
      switch (currentScreen) {
        case "home":
          return <AdminDashboardScreen />;
        case "clinicManager":
          return <AdminClinicsScreen />;
        case "doctorManager":
          return <AdminDoctorsScreen />;
        // case "userManager":
        //   return <ProfileScreen />;
        default:
          return <AdminDashboardScreen />;
      }
    }
  };

  const tabsByRole: Record<string, { id: Screen; label: string; icon: any }[]> =
    {
      user: [
        { id: "home", label: "Trang chủ", icon: Home },
        { id: "search", label: "Tìm kiếm", icon: Search },
        { id: "appointments", label: "Lịch hẹn", icon: Calendar },
        { id: "records", label: "Hồ sơ", icon: FileText },
        { id: "profile", label: "Cá nhân", icon: User },
      ],
      doctor: [
        { id: "home", label: "Trang chủ", icon: Home },
        { id: "appointments", label: "Lịch hẹn", icon: Calendar },
        { id: "profile", label: "Cá nhân", icon: User },
      ],
      admin: [
        { id: "home", label: "Dashboard", icon: Home },
        { id: "clinicManager", label: "Quản lý phòng khám", icon: Calendar },
        { id: "doctorManager", label: "Quản lý bác sĩ", icon: FileText },
        { id: "userManager", label: "Quản lý user", icon: User },
      ],
    };

  const tabs = role ? tabsByRole[role] : [];

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");

      if (token && userData) {
        setIsLoggedIn(true);
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.role) {
            setRole(parsedUser.role); // lấy role từ user
          }
        } catch (e) {
          console.error("Parse user error:", e);
        }
      }
    };
    checkAuth();
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
