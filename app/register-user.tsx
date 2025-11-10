import React from "react";
import RegisterScreen from "@/components/view/auth/RegisterScreen";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function RegisterUserPage() {
  return (
    <View>
      <Stack.Screen options={{ title: "Đăng ký người dùng" }} />
      <RegisterScreen />
    </View>
  );
}
