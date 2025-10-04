import React from "react";
import RegisterScreen from "@/components/view/auth/RegisterScreen";
import { Stack } from "expo-router";

export default function RegisterUserPage() {
  return (
    <>
      <Stack.Screen options={{ title: "Đăng ký người dùng" }} />
      <RegisterScreen />;
    </>
  );
}
