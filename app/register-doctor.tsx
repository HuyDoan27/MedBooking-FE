import React from "react";
import RegisterDoctor from "@/components/view/auth/RegisterDoctor";
import { Stack } from "expo-router";

export default function RegisterDoctorPage() {
  return (
    <>
      <Stack.Screen options={{ title: "Đăng ký bác sĩ" }} />
      <RegisterDoctor />;
    </>
  );
}
