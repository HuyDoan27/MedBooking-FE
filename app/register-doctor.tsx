import React from "react";
import RegisterDoctor from "@/components/view/auth/RegisterDoctor";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function RegisterDoctorPage() {
  return (
    <View>
      <Stack.Screen options={{ title: "Đăng ký bác sĩ" }} />
      <RegisterDoctor />
    </View>
  );
}
