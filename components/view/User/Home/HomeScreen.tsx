import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Doctor, Specialty } from "../../../types";

// Load MapView only on native
let MapView, Marker, PROVIDER_GOOGLE;
if (Platform.OS !== "web") {
  const maps = require("react-native-maps");
  MapView = maps.default;
  Marker = maps.Marker;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}

import { DoctorCard } from "./components/DoctorCard";
import { EmergencyCard } from "./components/EmergencyCard";
import { Header } from "./components/Header";
import { QuickActions } from "./components/QuickActions";
import { SectionHeader } from "./components/SectionHeader";
import { SpecialtyCard } from "./components/SpecialtyCard";

const { height } = Dimensions.get("window");

const specialties: Specialty[] = [
  { name: "Nội khoa", textColor: "#0891b2" },
  { name: "Nha khoa", textColor: "#16A34A" },
  { name: "Mắt", textColor: "#7C3AED" },
  { name: "Da liễu", textColor: "#EC4899" },
  { name: "Tai mũi họng", textColor: "#EA580C" },
  { name: "Sản phụ khoa", textColor: "#E11D48" },
];

// Thông tin chi tiết về chuyên khoa
const specialtyInfo: Record<
  string,
  { description: string; commonDiseases: string[]; advice: string }
> = {
  "Nội khoa": {
    description: "Chuyên khoa tổng quát cho người lớn, chẩn đoán và điều trị các bệnh nội khoa phổ biến.",
    commonDiseases: ["Tăng huyết áp", "Tiểu đường", "Viêm dạ dày", "Rối loạn mỡ máu"],
    advice: "Nên khám định kỳ 6-12 tháng/lần hoặc khi có triệu chứng mệt mỏi, đau ngực, khó thở.",
  },
  "Nha khoa": {
    description: "Chăm sóc răng miệng, điều trị bệnh răng và lợi, thẩm mỹ nha khoa.",
    commonDiseases: ["Sâu răng", "Viêm lợi", "Nhiễm trùng răng", "Hôi miệng"],
    advice: "Khám định kỳ 6 tháng/lần, vệ sinh răng miệng tốt để phòng bệnh.",
  },
  "Mắt": {
    description: "Khám và điều trị các bệnh về mắt, đo thị lực, tư vấn kính và phẫu thuật mắt cơ bản.",
    commonDiseases: ["Cận thị", "Viễn thị", "Glaucoma", "Đục thủy tinh thể"],
    advice: "Khám mắt ít nhất 1 năm/lần, đặc biệt nếu thường xuyên mỏi mắt, nhức mắt hoặc nhìn mờ.",
  },
  "Da liễu": {
    description: "Chăm sóc và điều trị các bệnh về da, tóc và móng, bao gồm cả vấn đề thẩm mỹ.",
    commonDiseases: ["Mụn trứng cá", "Nấm da", "Viêm da cơ địa", "Rụng tóc"],
    advice: "Khám khi có dấu hiệu bất thường trên da, ngứa, phát ban hoặc thay đổi màu da.",
  },
  "Tai mũi họng": {
    description: "Điều trị các bệnh lý về tai, mũi, họng và các vấn đề liên quan hô hấp trên.",
    commonDiseases: ["Viêm họng", "Viêm tai giữa", "Ngáy ngủ", "Viêm xoang"],
    advice: "Khám khi có đau họng kéo dài, ù tai, mất thính lực hoặc nghẹt mũi thường xuyên.",
  },
  "Sản phụ khoa": {
    description: "Chăm sóc sức khỏe phụ nữ, theo dõi thai kỳ và điều trị các bệnh phụ khoa.",
    commonDiseases: ["Viêm nhiễm phụ khoa", "Rối loạn kinh nguyệt", "Mang thai nguy cơ cao"],
    advice: "Khám định kỳ 6 tháng/lần, khám thai định kỳ theo lịch bác sĩ, sàng lọc các bệnh phụ khoa.",
  },
};

const nearbyDoctors: Doctor[] = [
  {
    id: 1,
    name: "BS. Nguyễn Văn An",
    specialty: "Nội khoa",
    clinic: "Phòng khám Đa khoa Thái Hà",
    rating: 4.0,
    reviews: 562,
    distance: "0.5 km",
    price: "250.000đ",
    nextSlot: "09:30",
    image: "",
    isOnline: true,
    latitude: 21.0183,
    longitude: 105.8260,
  },
  {
    id: 2,
    name: "BS. Trần Thị Bình",
    specialty: "Nha khoa",
    clinic: "Phòng khám Đa khoa Quốc tế Hà Nội",
    rating: 4.3,
    reviews: 2214,
    distance: "1.2 km",
    price: "300.000đ",
    nextSlot: "10:00",
    image: "",
    isOnline: false,
    latitude: 21.0075,
    longitude: 105.8278,
  },
  {
    id: 3,
    name: "BS. Lê Minh Cường",
    specialty: "Nội tổng quát",
    clinic: "Phòng khám Đa khoa Cộng đồng",
    rating: 4.2,
    reviews: 707,
    distance: "2.0 km",
    price: "200.000đ",
    nextSlot: "11:15",
    image: "",
    isOnline: true,
    latitude: 21.0145,
    longitude: 105.8465,
  },
  {
    id: 4,
    name: "BS. Phạm Thị Hồng",
    specialty: "Mắt",
    clinic: "Bệnh viện Mắt Hà Nội",
    rating: 4.5,
    reviews: 980,
    distance: "3.1 km",
    price: "350.000đ",
    nextSlot: "14:00",
    image: "",
    isOnline: true,
    latitude: 21.0278,
    longitude: 105.8342,
  },
  {
    id: 5,
    name: "BS. Hoàng Văn Dũng",
    specialty: "Nhi khoa",
    clinic: "Phòng khám Nhi Hà Nội",
    rating: 4.6,
    reviews: 430,
    distance: "1.8 km",
    price: "280.000đ",
    nextSlot: "15:30",
    image: "",
    isOnline: false,
    latitude: 21.0243,
    longitude: 105.8390,
  },
];

const initialRegion = {
  latitude: 21.0285,
  longitude: 105.8542,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};


const medicalImages = [
  require("@/assets/images/noikhoa.jpg"), // Nội khoa
  require("@/assets/images/nhakhoa.jpg"), // Nha khoa
  require("@/assets/images/khoamat.jpg"), // Mắt
  require("@/assets/images/dalieu.jpg"), // Da liễu
  require("@/assets/images/taimuihong.jpg"), // Tai mũi họng
  require("@/assets/images/sanphukhoa.png"), // Sản phụ khoa
];


const HomeScreen: React.FC = () => {
  const mapRef = useRef(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.fullName || "Người dùng");
        }
      } catch (e) {
        console.warn("Lỗi khi lấy user:", e);
      }
    })();
  }, []);

  // handlers
  const alertBox = (title: string, msg: string) => Alert.alert(title, msg);

  const handleDoctorSelect = useCallback(
    (doctor: Doctor) => {
      setSelectedDoctor(doctor);
      if (mapRef.current && doctor.latitude && doctor.longitude) {
        mapRef.current.animateToRegion(
          {
            latitude: doctor.latitude,
            longitude: doctor.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          800
        );
      }
    },
    [mapRef]
  );

  const handleSpecialtyPress = (name: string) => {
    setSelectedSpecialty(name);
    setModalVisible(true);
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Header
            userName={userName}
            onNotificationPress={() => alertBox("Thông báo", "Bạn có 3 thông báo mới")}
            onCalendarPress={() => alertBox("Lịch hẹn", "Bạn có 2 lịch hẹn hôm nay")}
          />
          <QuickActions onActionPress={(a) => alertBox("Hành động", a.title)} />
        </View>

        {/* Nội dung chính */}
        <View style={styles.content}>
          {/* Map */}
          <SectionHeader title="Phòng khám gần bạn" />
          {Platform.OS !== "web" && MapView ? (
            <View style={styles.mapBox}>
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation
                showsMyLocationButton
              >
                {nearbyDoctors.map((doc) => (
                  <Marker
                    key={doc.id}
                    coordinate={{
                      latitude: doc.latitude,
                      longitude: doc.longitude,
                    }}
                    pinColor={selectedDoctor?.id === doc.id ? "#0891b2" : "#EC4899"}
                    title={doc.name}
                    description={doc.specialty}
                    onPress={() => setSelectedDoctor(doc)}
                  />
                ))}
              </MapView>
            </View>
          ) : (
            <View style={styles.webPlaceholder}>
              <Text style={styles.webText}>📍 Bản đồ chỉ khả dụng trên thiết bị di động</Text>
            </View>
          )}

          {/* Chuyên khoa */}
          <SectionHeader title="Chuyên khoa phổ biến" onViewAllPress={() => alertBox("Xem tất cả", "Chuyên khoa")} />
          <View style={styles.grid}>
            {specialties.map((item, index) => (
              <SpecialtyCard
                key={index}
                specialty={{ ...item, image: medicalImages[index] }}
                onPress={() => handleSpecialtyPress(item.name)}
              />
            ))}

          </View>

          {/* Bác sĩ */}
          <SectionHeader
            title="Bác sĩ nổi bật"
            subtitle="Dựa trên vị trí & đánh giá cao"
            onViewAllPress={() => alertBox("Danh sách", "Xem tất cả bác sĩ")}
          />
          {nearbyDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onBookPress={() => alertBox("Đặt lịch", `Với ${doc.name}`)}
              onCallPress={() => alertBox("Gọi", `Đến ${doc.name}`)}
              onCardPress={() => handleDoctorSelect(doc)}
            />
          ))}

          {/* Cấp cứu */}
          <EmergencyCard onPress={() => alertBox("Cấp cứu", "Chọn số điện thoại khẩn cấp")} />
        </View>
      </ScrollView>

      {/* Modal hiển thị thông tin chuyên khoa */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedSpecialty}</Text>
            <Text style={styles.modalSubtitle}>Mô tả:</Text>
            <Text style={styles.modalDescription}>
              {selectedSpecialty ? specialtyInfo[selectedSpecialty].description : ""}
            </Text>
            <Text style={styles.modalSubtitle}>Bệnh thường gặp:</Text>
            <Text style={styles.modalDescription}>
              {selectedSpecialty ? specialtyInfo[selectedSpecialty].commonDiseases.join(", ") : ""}
            </Text>
            <Text style={styles.modalSubtitle}>Lời khuyên:</Text>
            <Text style={styles.modalDescription}>
              {selectedSpecialty ? specialtyInfo[selectedSpecialty].advice : ""}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  scroll: { flex: 1 },
  headerSection: {
    backgroundColor: "#0891b2",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 70,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  content: {
    marginTop: -40,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mapBox: {
    height: height * 0.3,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
    backgroundColor: "#fff",
  },
  map: { flex: 1 },
  webPlaceholder: {
    height: 200,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    marginBottom: 20,
  },
  webText: { color: "#0369A1", fontWeight: "600" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0891b2",
    textAlign: "center",
  },
  modalSubtitle: {
    fontWeight: "600",
    marginTop: 10,
  },
  modalDescription: {
    marginTop: 4,
    fontSize: 14,
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#0891b2",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
});

export default HomeScreen;
