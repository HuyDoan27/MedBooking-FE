import { getAllDoctors, updateDoctorStatus } from "@/services/DoctorService";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";

type Doctor = {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  specialty: {
    _id: string;
    name: string;
  };
  clinic?: {
    _id: string;
    name: string;
    address: string;
  };
  clinicName?: string;
  clinicAddress?: string;
  experience: string | number;
  qualifications?: string[];
  rating?: number;
  totalReviews?: number;
  totalAppointments?: number;
  status: 1 | 2 | 3;
  avatar?: string;
  rejectReason?: string;
  createdAt?: string;
};

export default function AdminDoctorsScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | 1 | 2 | 3>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getAllDoctors();
      if (response.data.success) {
        setDoctors(response.data.data);
        applyFilters(response.data.data, filterStatus, searchQuery);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải danh sách bác sĩ",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const applyFilters = (
    data: Doctor[],
    status: "all" | 1 | 2 | 3,
    search: string
  ) => {
    let filtered = data;

    if (status !== "all") {
      filtered = filtered.filter((d) => d.status === status);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((d) => {
        const fullName = d.fullName?.toLowerCase() || "";
        const specialty = d.specialty?.name?.toLowerCase() || "";
        const clinic = d.clinic?.name?.toLowerCase() || "";
        const clinicName = d.clinicName?.toLowerCase() || "";
        return (
          fullName.includes(searchLower) ||
          specialty.includes(searchLower) ||
          clinic.includes(searchLower) ||
          clinicName.includes(searchLower)
        );
      });
    }

    setFilteredDoctors(filtered);
  };

  useEffect(() => {
    applyFilters(doctors, filterStatus, searchQuery);
  }, [filterStatus, searchQuery, doctors]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDoctors();
    setRefreshing(false);
  };

  const handleApprove = (doctor: Doctor) => {
    Alert.alert(
      "Xác nhận duyệt",
      `Bạn có chắc muốn duyệt bác sĩ ${doctor.fullName}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Duyệt",
          onPress: async () => {
            try {
              Toast.show({ type: "info", text1: "Đang xử lý..." });
              const response = await updateDoctorStatus(doctor._id, 1);
              if (response.data.success) {
                Toast.show({
                  type: "success",
                  text1: "Thành công",
                  text2: "Đã duyệt bác sĩ",
                });
                fetchDoctors();
              } else {
                Toast.show({
                  type: "error",
                  text1: "Lỗi",
                  text2: response.data.message || "Không thể duyệt bác sĩ",
                });
              }
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: "Không thể kết nối đến server",
              });
            }
          },
        },
      ]
    );
  };

  const handleRejectPress = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setRejectReason("");
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      Toast.show({
        type: "error",
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập lý do từ chối",
      });
      return;
    }

    if (!selectedDoctor) return;

    try {
      setRejectModalVisible(false);
      Toast.show({ type: "info", text1: "Đang xử lý..." });

      const response = await updateDoctorStatus(
        selectedDoctor._id,
        3,
        rejectReason.trim()
      );

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã từ chối bác sĩ",
        });
        fetchDoctors();
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: response.data.message || "Không thể từ chối bác sĩ",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể kết nối đến server",
      });
    } finally {
      setSelectedDoctor(null);
      setRejectReason("");
    }
  };

  const getStatusConfig = (status: number) => {
    switch (status) {
      case 1:
        return {
          label: "Hoạt động",
          bgColor: "#dcfce7",
          textColor: "#15803d",
        };
      case 2:
        return {
          label: "Chờ duyệt",
          bgColor: "#fed7aa",
          textColor: "#c2410c",
        };
      case 3:
        return {
          label: "Đã từ chối",
          bgColor: "#fee2e2",
          textColor: "#dc2626",
        };
      default:
        return {
          label: "Khác",
          bgColor: "#f1f5f9",
          textColor: "#64748b",
        };
    }
  };

  const stats = {
    total: doctors.length,
    active: doctors.filter((d) => d.status === 1).length,
    pending: doctors.filter((d) => d.status === 2).length,
    rejected: doctors.filter((d) => d.status === 3).length,
  };

  const renderDoctorCard = ({ item }: { item: Doctor }) => {
    const statusConfig = getStatusConfig(item.status);
    const isPending = item.status === 2;

    return (
      <View style={styles.doctorCard}>
        <View style={styles.doctorContent}>
          <LinearGradient
            colors={["#e0f2fe", "#dbeafe"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Feather name="activity" size={28} color="#0891b2" />
          </LinearGradient>

          <View style={styles.doctorInfo}>
            <View style={styles.doctorHeader}>
              <View style={styles.doctorNameContainer}>
                <Text style={styles.doctorName}>{item.fullName}</Text>
                <Text style={styles.doctorSpecialty}>
                  {item.specialty?.name || "Chưa xác định"}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.bgColor },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: statusConfig.textColor }]}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            <Text style={styles.clinicText} numberOfLines={1}>
              {item.clinic?.name || item.clinicName || "Chưa có phòng khám"}
            </Text>

            <View style={styles.doctorStats}>
              <View style={styles.statItem}>
                <Feather name="star" size={14} color="#f59e0b" />
                <Text style={styles.statItemValue}>{item.rating || 0}</Text>
                <Text style={styles.statItemLabel}>
                  ({item.totalReviews || 0})
                </Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="award" size={14} color="#94a3b8" />
                <Text style={styles.statItemText}>
                  {typeof item.experience === "string"
                    ? item.experience
                    : `${item.experience || 0} năm`}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="calendar" size={14} color="#94a3b8" />
                <Text style={styles.statItemText}>
                  {item.totalAppointments || 0} lịch
                </Text>
              </View>
            </View>

            {item.status === 3 && item.rejectReason && (
              <View style={styles.rejectReasonBox}>
                <Feather name="alert-circle" size={12} color="#dc2626" />
                <Text style={styles.rejectReasonText} numberOfLines={2}>
                  {item.rejectReason}
                </Text>
              </View>
            )}

            {isPending && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(item)}
                  activeOpacity={0.7}
                >
                  <Feather name="check" size={14} color="white" />
                  <Text style={styles.actionButtonText}>Duyệt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleRejectPress(item)}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={14} color="white" />
                  <Text style={styles.actionButtonText}>Từ chối</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status === 1 && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButtonOutline}
                  activeOpacity={0.7}
                >
                  <Feather name="eye" size={14} color="#64748b" />
                  <Text style={styles.actionButtonOutlineText}>Chi tiết</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButtonOutline}
                  activeOpacity={0.7}
                >
                  <Feather name="edit-2" size={14} color="#64748b" />
                  <Text style={styles.actionButtonOutlineText}>Sửa</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const FilterTab = ({
    label,
    value,
    count,
  }: {
    label: string;
    value: "all" | 1 | 2 | 3;
    count: number;
  }) => {
    const isActive = filterStatus === value;
    return (
      <TouchableOpacity
        style={[styles.filterTab, isActive && styles.filterTabActive]}
        onPress={() => setFilterStatus(value)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.filterTabText, isActive && styles.filterTabTextActive]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.filterTabBadge,
            isActive && styles.filterTabBadgeActive,
          ]}
        >
          <Text
            style={[
              styles.filterTabBadgeText,
              isActive && styles.filterTabBadgeTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const RejectModal = () => (
    <Modal
      visible={rejectModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setRejectModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Feather name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.modalTitle}>Lý do từ chối</Text>
          </View>

          <Text style={styles.modalSubtitle}>
            Vui lòng nhập lý do từ chối bác sĩ {selectedDoctor?.fullName}
          </Text>

          <TextInput
            style={styles.rejectInput}
            placeholder="Nhập lý do từ chối..."
            placeholderTextColor="#94a3b8"
            value={rejectReason}
            onChangeText={setRejectReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => {
                setRejectModalVisible(false);
                setRejectReason("");
                setSelectedDoctor(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSubmitButton]}
              onPress={handleRejectSubmit}
              activeOpacity={0.7}
            >
              <Text style={styles.modalSubmitText}>Xác nhận từ chối</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Quản lý Bác sĩ</Text>
              <Text style={styles.headerSubtitle}>
                Quản lý tất cả bác sĩ trong hệ thống
              </Text>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Feather
              name="search"
              size={18}
              color="#94a3b8"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Tìm kiếm bác sĩ..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#94a3b8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tổng số</Text>
          <Text style={styles.statValue}>{stats.total}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Hoạt động</Text>
          <Text style={[styles.statValue, styles.statValueGreen]}>
            {stats.active}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Chờ duyệt</Text>
          <Text style={[styles.statValue, styles.statValueOrange]}>
            {stats.pending}
          </Text>
        </View>
      </View>

      <View
        style={styles.filterContainer}
      >
        <FilterTab label="Tất cả" value="all" count={stats.total} />
        <FilterTab label="Hoạt động" value={1} count={stats.active} />
        <FilterTab label="Chờ duyệt" value={2} count={stats.pending} />
        <FilterTab label="Đã từ chối" value={3} count={stats.rejected} />
      </View>

      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctorCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="user-x" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Không có bác sĩ</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Không tìm thấy bác sĩ phù hợp"
                : "Chưa có bác sĩ nào trong hệ thống"}
            </Text>
          </View>
        }
      />

      <RejectModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#0891b2",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingTop: 30,
    borderEndEndRadius: 16,
    borderEndStartRadius: 16,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#ccd9ecff",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0891b2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
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
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0f172a",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  statValueGreen: {
    color: "#10b981",
  },
  statValueOrange: {
    color: "#f97316",
  },
  filterContainer: {
    flexDirection: "row",
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterTabActive: {
    backgroundColor: "#e0f2fe",
    borderColor: "#0891b2",
  },
  filterTabText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  filterTabTextActive: {
    color: "#0891b2",
    fontWeight: "600",
  },
  filterTabBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: "center",
  },
  filterTabBadgeActive: {
    backgroundColor: "#0891b2",
  },
  filterTabBadgeText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  filterTabBadgeTextActive: {
    color: "white",
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  doctorCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  doctorContent: {
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  doctorNameContainer: {
    flex: 1,
    marginRight: 8,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#0891b2",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  clinicText: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  doctorStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statItemValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  statItemLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  statItemText: {
    fontSize: 12,
    color: "#64748b",
  },
  rejectReasonBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fef2f2",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  rejectReasonText: {
    flex: 1,
    fontSize: 12,
    color: "#dc2626",
    lineHeight: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  approveButton: {
    backgroundColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "transparent",
    gap: 4,
  },
  actionButtonOutlineText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  emptyState: {
    paddingTop: 80,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#475569",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    lineHeight: 20,
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#1e293b",
    minHeight: 120,
    backgroundColor: "#f8fafc",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelButton: {
    backgroundColor: "#f1f5f9",
  },
  modalSubmitButton: {
    backgroundColor: "#ef4444",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
  },
  modalSubmitText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
});
