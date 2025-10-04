import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Doctor, QuickAction, Specialty } from "../../types";
import { DoctorCard } from "./components/DoctorCard";
import { EmergencyCard } from "./components/EmergencyCard";
import { Header } from "./components/Header";
import { QuickActions } from "./components/QuickActions";
import { SectionHeader } from "./components/SectionHeader";
import { SpecialtyCard } from "./components/SpecialtyCard";

const specialties: Specialty[] = [
  { name: "Nội khoa", color: "#DBEAFE", textColor: "#2563EB" },
  { name: "Nha khoa", color: "#DCFCE7", textColor: "#16A34A" },
  { name: "Mắt", color: "#F3E8FF", textColor: "#7C3AED" },
  { name: "Da liễu", color: "#FCE7F3", textColor: "#EC4899" },
  { name: "Tai mũi họng", color: "#FED7AA", textColor: "#EA580C" },
  { name: "Sản phụ khoa", color: "#FECDD3", textColor: "#E11D48" },
];

const nearbyDoctors: Doctor[] = [
  {
    id: 1,
    name: "BS. Nguyễn Văn An",
    specialty: "Nội khoa",
    clinic: "Phòng khám Đa khoa An Khang",
    rating: 4.8,
    reviews: 124,
    distance: "0.8 km",
    price: "200.000đ",
    nextSlot: "14:30",
    image: "",
    isOnline: true,
  },
  {
    id: 2,
    name: "BS. Trần Thị Bình",
    specialty: "Nha khoa",
    clinic: "Nha khoa Smile Care",
    rating: 4.9,
    reviews: 89,
    distance: "1.2 km",
    price: "150.000đ",
    nextSlot: "15:00",
    image: "",
    isOnline: false,
  },
  {
    id: 3,
    name: "BS. Lê Minh Cường",
    specialty: "Mắt",
    clinic: "Bệnh viện Mắt TP.HCM",
    rating: 4.7,
    reviews: 156,
    distance: "2.1 km",
    price: "300.000đ",
    nextSlot: "16:15",
    image: "",
    isOnline: true,
  },
];

const HomeScreen: React.FC = () => {
  const [users, setUsers] = useState([]);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleNotificationPress = useCallback(() => {
    Alert.alert("Thông báo", "Bạn có 3 thông báo mới");
  }, []);

  const handleCalendarPress = useCallback(() => {
    Alert.alert("Lịch hẹn", "Bạn có 2 lịch hẹn hôm nay");
  }, []);

  const handleSearchSubmit = useCallback((query: string) => {
    Alert.alert("Tìm kiếm", `Tìm kiếm: ${query}`);
  }, []);

  const handleQuickAction = useCallback((action: QuickAction) => {
    Alert.alert("Action", `Bạn đã chọn: ${action.title}`);
  }, []);

  const handleSpecialtyPress = useCallback((specialty: Specialty) => {
    Alert.alert("Chuyên khoa", `Bạn đã chọn: ${specialty.name}`);
  }, []);

  const handleDoctorBook = useCallback((doctor: Doctor) => {
    Alert.alert("Đặt lịch", `Đặt lịch với ${doctor.name}`);
  }, []);

  const handleDoctorCall = useCallback((doctor: Doctor) => {
    Alert.alert("Gọi điện", `Gọi cho ${doctor.name}`);
  }, []);

  const handleDoctorPress = useCallback((doctor: Doctor) => {
    Alert.alert("Chi tiết bác sĩ", `Xem thông tin ${doctor.name}`);
  }, []);

  const handleEmergencyPress = useCallback(() => {
    Alert.alert("Cấp cứu", "Chọn số điện thoại cấp cứu");
  }, []);

  const handleViewAllSpecialties = useCallback(() => {
    Alert.alert("Chuyên khoa", "Xem tất cả chuyên khoa");
  }, []);

  const handleViewAllDoctors = useCallback(() => {
    Alert.alert("Bác sĩ", "Xem tất cả bác sĩ");
  }, []);

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header Section with Gradient Background */}
      <View style={styles.headerSection}>
        <Header
          userName="Huy"
          onNotificationPress={handleNotificationPress}
          onCalendarPress={handleCalendarPress}
        />
        {/* <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearchSubmit}
        /> */}
        <QuickActions onActionPress={handleQuickAction} />
      </View>

      <View style={styles.contentSection}>
        {/* Specialties Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Chuyên khoa phổ biến"
            onViewAllPress={handleViewAllSpecialties}
          />
          <View style={styles.specialtyGrid}>
            {specialties.map((specialty, index) => (
              <SpecialtyCard
                key={index}
                specialty={specialty}
                onPress={handleSpecialtyPress}
              />
            ))}
          </View>
        </View>

        {/* Recommended Doctors Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Bác sĩ được đề xuất"
            subtitle="Dựa trên vị trí và đánh giá cao"
            onViewAllPress={handleViewAllDoctors}
          />
          {nearbyDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBookPress={handleDoctorBook}
              onCallPress={handleDoctorCall}
              onCardPress={handleDoctorPress}
            />
          ))}
        </View>

        {/* Emergency Card */}
        <EmergencyCard onPress={handleEmergencyPress} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 80,
  },
  contentSection: {
    borderRadius: 30,
    backgroundColor: "#f3e7e7ff",
    flex: 1,
    paddingHorizontal: 24,
    marginTop: -48,
    width: "95%",
    marginLeft: "2.5%",
  },
  section: {
    padding: 30,
  },
  specialtyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default HomeScreen;
