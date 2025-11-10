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
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

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
      <StatusBar barStyle="light-content" backgroundColor="#0891b2" />

      {/* Header với Gradient */}
      <LinearGradient
        colors={["#0891b2", "#06b6d4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Quản lý Phòng khám</Text>
              <Text style={styles.headerSubtitle}>
                {clinics.length} phòng khám trong hệ thống
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.8}
              onPress={() => setIsCreateModalVisible(true)}
            >
              <LinearGradient
                colors={["#ffffff", "#f0fdfa"]}
                style={styles.addButtonGradient}
              >
                <Feather name="plus" size={16} color="#0891b2" />
                <Text style={styles.addButtonText}>Thêm mới</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={18} color="#64748b" />
            <TextInput
              placeholder="Tìm kiếm phòng khám..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#94a3b8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Loading / Danh sách */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0891b2" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.listContainer}>
            {filteredClinics.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🏥</Text>
                <Text style={styles.emptyText}>Không tìm thấy phòng khám</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery
                    ? "Thử tìm kiếm với từ khóa khác"
                    : "Chưa có phòng khám nào"}
                </Text>
              </View>
            ) : (
              filteredClinics.map((clinic) => (
                <TouchableOpacity
                  key={clinic._id}
                  style={styles.clinicCard}
                  activeOpacity={0.95}
                  onPress={() => openClinicDetail(clinic)}
                >
                  <View style={styles.clinicContent}>
                    <LinearGradient
                      colors={["#e0f2fe", "#cffafe"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.clinicIconWrapper}
                    >
                      <View style={styles.clinicIconInner}>
                        <Feather name="home" size={28} color="#0891b2" />
                      </View>
                    </LinearGradient>

                    <View style={styles.clinicInfo}>
                      <View style={styles.clinicHeader}>
                        <Text style={styles.clinicName} numberOfLines={1}>
                          {clinic.name}
                        </Text>
                        {clinic.isVerified && (
                          <View style={styles.verifiedBadge}>
                            <Feather
                              name="check-circle"
                              size={14}
                              color="#22c55e"
                            />
                          </View>
                        )}
                      </View>

                      <View style={styles.infoRow}>
                        <Feather name="map-pin" size={12} color="#64748b" />
                        <Text style={styles.infoText} numberOfLines={1}>
                          {clinic.address}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Feather name="phone" size={12} color="#64748b" />
                        <Text style={styles.infoText}>
                          {clinic.phone || "Chưa có SĐT"}
                        </Text>
                      </View>

                      <View style={styles.statsRow}>
                        <View style={styles.statBadge}>
                          <Feather name="users" size={12} color="#0891b2" />
                          <Text style={styles.statText}>
                            {clinic.doctors?.length || 0} bác sĩ
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.detailButton}
                          onPress={() => openClinicDetail(clinic)}
                        >
                          <Text style={styles.detailButtonText}>Chi tiết</Text>
                          <Feather
                            name="chevron-right"
                            size={14}
                            color="#0891b2"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Modal Chi tiết phòng khám - PREMIUM */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header Modal */}
            <LinearGradient
              colors={["#0891b2", "#06b6d4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHeader}
            >
              <Text style={styles.modalHeaderTitle}>Chi tiết phòng khám</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeIconButton}
              >
                <Feather name="x" size={22} color="#ffffff" />
              </TouchableOpacity>
            </LinearGradient>

            {selectedClinic ? (
              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Clinic Info Card */}
                <View style={styles.clinicDetailCard}>
                  <View style={styles.clinicDetailHeader}>
                    <LinearGradient
                      colors={["#e0f2fe", "#cffafe"]}
                      style={styles.clinicDetailIcon}
                    >
                      <Feather name="home" size={32} color="#0891b2" />
                    </LinearGradient>

                    <View style={styles.clinicDetailInfo}>
                      <Text style={styles.modalTitle}>
                        {selectedClinic.name}
                      </Text>
                      {selectedClinic.isVerified && (
                        <View style={styles.verifiedRow}>
                          <Feather
                            name="check-circle"
                            size={14}
                            color="#22c55e"
                          />
                          <Text style={styles.verifiedText}>Đã xác minh</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <View style={styles.iconCircle}>
                        <Feather name="map-pin" size={14} color="#0891b2" />
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Địa chỉ</Text>
                        <Text style={styles.detailValue}>
                          {selectedClinic.address}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.iconCircle}>
                        <Feather name="phone" size={14} color="#0891b2" />
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Số điện thoại</Text>
                        <Text style={styles.detailValue}>
                          {selectedClinic.phone || "Chưa có số điện thoại"}
                        </Text>
                      </View>
                    </View>

                    {selectedClinic.description && (
                      <View style={styles.detailRow}>
                        <View style={styles.iconCircle}>
                          <Feather name="info" size={14} color="#0891b2" />
                        </View>
                        <View style={styles.detailTextContainer}>
                          <Text style={styles.detailLabel}>Mô tả</Text>
                          <Text style={styles.detailValue}>
                            {selectedClinic.description}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Doctors Section */}
                <View style={styles.doctorsSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Đội ngũ bác sĩ</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>
                        {selectedClinic.doctors?.length || 0}
                      </Text>
                    </View>
                  </View>

                  {selectedClinic.doctors?.length > 0 ? (
                    selectedClinic.doctors.map((doc, index) => (
                      <View key={index} style={styles.doctorCard}>
                        <View style={styles.doctorHeader}>
                          <View style={styles.doctorAvatar}>
                            <Text style={styles.doctorAvatarText}>
                              {doc.fullName?.charAt(0).toUpperCase()}
                            </Text>
                          </View>

                          <View style={styles.doctorMainInfo}>
                            <Text style={styles.doctorName}>
                              {doc.fullName}
                            </Text>
                            <View style={styles.specialtyBadge}>
                              <Feather name="award" size={10} color="#0891b2" />
                              <Text style={styles.doctorSpecialty}>
                                {doc.specialty?.name || "Đa khoa"}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.doctorDetails}>
                          <View style={styles.doctorInfoRow}>
                            <Feather name="phone" size={12} color="#64748b" />
                            <Text style={styles.doctorInfoText}>
                              {doc.phoneNumber}
                            </Text>
                          </View>
                          <View style={styles.doctorInfoRow}>
                            <Feather
                              name="briefcase"
                              size={12}
                              color="#64748b"
                            />
                            <Text style={styles.doctorInfoText}>
                              {doc.experience} năm kinh nghiệm
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyDoctors}>
                      <Text style={styles.emptyDoctorsIcon}>👨‍⚕️</Text>
                      <Text style={styles.emptyDoctorsText}>
                        Chưa có bác sĩ nào
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#0891b2" />
              </View>
            )}

            {/* Footer Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <LinearGradient
                  colors={["#0891b2", "#06b6d4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.closeButtonGradient}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal thêm mới phòng khám */}
      <CreateClinicModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={handleSubmitClinic}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: { paddingHorizontal: 20 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 14, color: "#e0f2fe", fontWeight: "500" },
  addButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  addButtonText: { color: "#0891b2", fontSize: 14, fontWeight: "700" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#0f172a" },
  scrollView: { flex: 1 },
  listContainer: { padding: 16, gap: 16 },
  clinicCard: {
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  clinicContent: { flexDirection: "row", padding: 16, gap: 14 },
  clinicIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  clinicIconInner: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  clinicInfo: { flex: 1, justifyContent: "space-between" },
  clinicHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  clinicName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#64748b",
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ecfeff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0891b2",
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#e0f2fe",
    borderRadius: 8,
  },
  detailButtonText: {
    color: "#0891b2",
    fontSize: 13,
    fontWeight: "600",
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: "#64748b", fontSize: 14 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  emptySubtext: { fontSize: 14, color: "#94a3b8" },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    width: "90%",
    height: "85%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  closeIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  clinicDetailCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  clinicDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  clinicDetailIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  clinicDetailInfo: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verifiedText: {
    fontSize: 13,
    color: "#22c55e",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginBottom: 16,
  },
  detailSection: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
  },
  doctorsSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  countBadge: {
    backgroundColor: "#0891b2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: "center",
  },
  countText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  doctorCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#bae6fd",
  },
  doctorAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0891b2",
  },
  doctorMainInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  specialtyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "#ecfeff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: "#0891b2",
    fontWeight: "600",
  },
  doctorDetails: {
    gap: 8,
  },
  doctorInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  doctorInfoText: {
    fontSize: 13,
    color: "#64748b",
  },
  emptyDoctors: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyDoctorsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyDoctorsText: {
    fontSize: 15,
    color: "#94a3b8",
    fontStyle: "italic",
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  closeButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
