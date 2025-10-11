import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getClinicsWithDoctors, createClinic } from "@/services/ClinicService";
import CreateClinicModal from "./components/CreateClinicModal ";

export default function AdminClinicsScreen() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false); // ✅ modal thêm mới

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const res = await getClinicsWithDoctors();
      if (res.data.success) {
        setClinics(res.data.data);
      } else {
        Alert.alert("Lỗi", "Không thể lấy danh sách phòng khám");
      }
    } catch (error) {
      console.error("Fetch clinics error:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xử lý thêm mới bằng modal
  const handleSubmitClinic = async (clinicData) => {
    try {
      const res = await createClinic(clinicData);
      if (res.data.success) {
        Alert.alert("Thành công", "Đã tạo phòng khám mới");
        setIsCreateModalVisible(false);
        fetchClinics();
      } else {
        Alert.alert("Thất bại", res.data.message || "Không thể tạo");
      }
    } catch (err) {
      console.error("Create clinic error:", err);
      Alert.alert("Lỗi", "Không thể tạo phòng khám");
    }
  };

  const filteredClinics = clinics.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openClinicDetail = (clinic) => {
    setSelectedClinic(clinic);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Quản lý Phòng khám</Text>
              <Text style={styles.headerSubtitle}>
                Quản lý tất cả phòng khám trong hệ thống
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.8}
              onPress={() => setIsCreateModalVisible(true)} // ✅ mở modal thêm
            >
              <Feather name="plus" size={16} color="black" />
              <Text style={styles.addButtonText}>Thêm mới</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Feather
              name="search"
              size={18}
              color="#94a3b8"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Tìm kiếm phòng khám..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>
      </View>

      {/* Loading / Danh sách */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0891b2" />
          <Text style={{ color: "#64748b", marginTop: 10 }}>
            Đang tải dữ liệu...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.listContainer}>
            {filteredClinics.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#94a3b8" }}>
                Không có phòng khám nào
              </Text>
            ) : (
              filteredClinics.map((clinic) => (
                <View key={clinic._id} style={styles.clinicCard}>
                  <View style={styles.clinicContent}>
                    <LinearGradient
                      colors={["#e0f2fe", "#dbeafe"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.clinicIcon}
                    >
                      <Feather name="home" size={32} color="#0891b2" />
                    </LinearGradient>

                    <View style={styles.clinicInfo}>
                      <Text style={styles.clinicName}>{clinic.name}</Text>
                      <Text style={styles.contactText}>{clinic.address}</Text>
                      <Text style={styles.contactText}>{clinic.phone}</Text>

                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.detailButton}
                          onPress={() => openClinicDetail(clinic)}
                        >
                          <Feather name="eye" size={14} color="#0891b2" />
                          <Text style={styles.detailButtonText}>Chi tiết</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Modal Chi tiết phòng khám */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedClinic ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>{selectedClinic.name}</Text>
                <Text style={styles.modalAddress}>
                  📍 {selectedClinic.address}
                </Text>
                <Text style={styles.modalPhone}>
                  ☎️ {selectedClinic.phone || "Chưa có số điện thoại"}
                </Text>
                <Text style={styles.modalDescription}>
                  {selectedClinic.description || "Chưa có mô tả"}
                </Text>

                <Text style={styles.sectionTitle}>👨‍⚕️ Danh sách bác sĩ</Text>
                {selectedClinic.doctors?.length > 0 ? (
                  selectedClinic.doctors.map((doc, index) => (
                    <View key={index} style={styles.doctorCard}>
                      <Text style={styles.doctorName}>{doc.fullName}</Text>
                      <Text style={styles.doctorSpecialty}>
                        {doc.specialty?.name || "Chưa có chuyên khoa"}
                      </Text>
                      <Text style={styles.doctorContact}>
                        📞 {doc.phoneNumber}
                      </Text>
                      <Text style={styles.doctorExperience}>
                        🩺 {doc.experience} năm kinh nghiệm
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDoctorText}>Không có bác sĩ nào.</Text>
                )}
              </ScrollView>
            ) : (
              <ActivityIndicator size="large" color="#0891b2" />
            )}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ✅ Modal thêm mới phòng khám */}
      <CreateClinicModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={handleSubmitClinic}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#0891b2",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingTop: 30,
    borderEndEndRadius: 16,
    borderEndStartRadius: 16,
  },
  headerContent: { paddingHorizontal: 16, paddingBottom: 16 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffffff",
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 13, color: "#c8d7ecff" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: { color: "black", fontSize: 14, fontWeight: "600" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#0f172a" },
  listContainer: { padding: 16, gap: 16 },
  clinicCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  clinicContent: { flexDirection: "row", gap: 12 },
  clinicIcon: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  clinicInfo: { flex: 1, justifyContent: "center" },
  clinicName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  contactText: { fontSize: 12, color: "#64748b", lineHeight: 18 },
  actionRow: { flexDirection: "row", marginTop: 8 },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#0891b2",
    borderRadius: 6,
  },
  detailButtonText: { color: "#0891b2", fontSize: 12, fontWeight: "500" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    maxHeight: "85%",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  modalAddress: { color: "#475569", fontSize: 13, marginBottom: 4 },
  modalPhone: { color: "#475569", fontSize: 13, marginBottom: 8 },
  modalDescription: { color: "#334155", fontSize: 14, marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  doctorCard: {
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  doctorName: { fontWeight: "600", color: "#0f172a" },
  doctorSpecialty: { color: "#0891b2", fontSize: 13 },
  doctorContact: { color: "#64748b", fontSize: 12 },
  doctorExperience: { color: "#475569", fontSize: 12 },
  noDoctorText: { color: "#94a3b8", fontStyle: "italic" },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#0891b2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: { color: "white", fontWeight: "600" },
});
