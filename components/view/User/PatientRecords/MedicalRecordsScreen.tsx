import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  Pill,
  Plus,
  Search,
  X,
  User,
  Phone,
  Mail,
} from "lucide-react-native";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { getMedicalReportsByPatient } from "@/services/AppointmentService";
import {
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";

type TabType = "records" | "prescriptions" | "tests";

interface MedicalRecord {
  appointmentId: string;
  appointmentDate: string;
  doctor?: {
    id?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
  } | null;
  medicalReport: {
    condition: string;
    treatmentMethod: string;
    prescription: { medicine?: string; dosage?: string; duration?: string }[];
    notes?: string;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
  status?: string;
}

interface Prescription {
  id: number;
  date: string;
  doctor: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: "active" | "completed" | "expired";
  appointmentId: string;
}

interface TestResult {
  id: number;
  date: string;
  testName: string;
  result: string;
  normalRange: string;
  status: "normal" | "abnormal" | "pending";
  doctor: string;
}

export default function MedicalRecordsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("records");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<MedicalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Derive prescriptions from reports
  const prescriptions: Prescription[] = useMemo(() => {
    const meds: Prescription[] = [];
    reports.forEach((r, idx) => {
      (r.medicalReport.prescription || []).forEach((p, pIdx) => {
        const appointmentDate = dayjs(r.appointmentDate);
        const now = dayjs();
        let status: "active" | "completed" | "expired" = "completed";
        
        // Simple logic: if appointment within last 30 days, consider active
        if (appointmentDate.isAfter(now.subtract(30, "day"))) {
          status = "active";
        }
        
        meds.push({
          id: Number(`${idx}${pIdx}`),
          date: appointmentDate.format("DD/MM/YYYY"),
          doctor: r.doctor?.name || "Không rõ",
          medication: p.medicine || "Không rõ",
          dosage: p.dosage || "",
          frequency: "",
          duration: p.duration || "",
          status,
          appointmentId: r.appointmentId,
        });
      });
    });
    return meds.sort((a, b) => dayjs(b.date, "DD/MM/YYYY").diff(dayjs(a.date, "DD/MM/YYYY")));
  }, [reports]);

  const testResults: TestResult[] = [
    {
      id: 1,
      date: "10/02/2024",
      testName: "Xét nghiệm máu tổng quát",
      result: "Bình thường",
      normalRange: "Trong giới hạn bình thường",
      status: "normal",
      doctor: "Nguyễn Thị Lan",
    },
    {
      id: 2,
      date: "15/03/2024",
      testName: "X-quang ngực",
      result: "Phổi sạch",
      normalRange: "Không có bất thường",
      status: "normal",
      doctor: "Trần Văn Hùng",
    },
  ];

  // Filter and search
  const filteredRecords = useMemo(() => {
    let filtered = reports;

    if (selectedFilter !== "all") {
      filtered = filtered.filter((r) => (r.status || "completed") === selectedFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((r) =>
        (r.medicalReport.condition || "").toLowerCase().includes(q) ||
        (r.doctor?.name || "").toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => 
      dayjs(b.appointmentDate).diff(dayjs(a.appointmentDate))
    );
  }, [searchQuery, selectedFilter, reports]);

  const filteredPrescriptions = useMemo(() => {
    if (!searchQuery) return prescriptions;
    const q = searchQuery.toLowerCase();
    return prescriptions.filter(p => 
      p.medication.toLowerCase().includes(q) ||
      p.doctor.toLowerCase().includes(q)
    );
  }, [searchQuery, prescriptions]);

  const filteredTests = useMemo(() => {
    if (!searchQuery) return testResults;
    const q = searchQuery.toLowerCase();
    return testResults.filter(t => 
      t.testName.toLowerCase().includes(q) ||
      t.doctor.toLowerCase().includes(q)
    );
  }, [searchQuery, testResults]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) {
        setError("Không xác định được người dùng");
        setReports([]);
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user._id;
      const res = await getMedicalReportsByPatient(userId);
      if (res?.data?.success) {
        setReports(res.data.data || []);
      } else {
        setError("Không thể tải báo cáo");
      }
    } catch (err: any) {
      console.error("loadReports error", err);
      setError(err.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "ongoing":
        return "#f59e0b";
      case "scheduled":
        return "#3b82f6";
      case "active":
        return "#10b981";
      case "expired":
        return "#ef4444";
      case "normal":
        return "#10b981";
      case "abnormal":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "normal":
        return <CheckCircle size={16} color="#10b981" />;
      case "ongoing":
      case "pending":
        return <Clock size={16} color="#f59e0b" />;
      case "scheduled":
        return <Calendar size={16} color="#3b82f6" />;
      case "abnormal":
      case "expired":
        return <AlertCircle size={16} color="#ef4444" />;
      case "active":
        return <CheckCircle size={16} color="#10b981" />;
      default:
        return <AlertCircle size={16} color="#6b7280" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Hoàn thành";
      case "ongoing": return "Đang điều trị";
      case "scheduled": return "Đã lên lịch";
      case "active": return "Đang dùng";
      case "expired": return "Hết hạn";
      case "normal": return "Bình thường";
      case "abnormal": return "Bất thường";
      case "pending": return "Chờ kết quả";
      default: return status;
    }
  };

  const TabButton = ({
    tab,
    label,
    icon,
    count,
  }: {
    tab: TabType;
    label: string;
    icon: any;
    count?: number;
  }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={{
        flex: 1,
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderBottomWidth: 3,
        borderBottomColor: activeTab === tab ? "#059669" : "transparent",
        backgroundColor: activeTab === tab ? "#f0fdf4" : "transparent",
      }}
    >
      <View style={{ position: "relative" }}>
        {React.cloneElement(icon, {
          size: 22,
          color: activeTab === tab ? "#059669" : "#6b7280",
        })}
        {count !== undefined && count > 0 && (
          <View
            style={{
              position: "absolute",
              top: -4,
              right: -8,
              backgroundColor: "#ef4444",
              borderRadius: 10,
              minWidth: 18,
              height: 18,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
              {count > 99 ? "99+" : count}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={{
          fontSize: 13,
          fontWeight: activeTab === tab ? "700" : "500",
          color: activeTab === tab ? "#059669" : "#6b7280",
          marginTop: 6,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const RecordCard = ({ record }: { record: MedicalRecord }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedRecord(record);
        setDetailModalVisible(true);
      }}
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 5,
        borderLeftColor: "#059669",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                backgroundColor: "#f0fdf4",
                padding: 8,
                borderRadius: 10,
                marginRight: 10,
              }}
            >
              <FileText size={20} color="#059669" />
            </View>
            <Text
              style={{
                fontWeight: "700",
                fontSize: 17,
                flex: 1,
                color: "#111827",
              }}
              numberOfLines={2}
            >
              {record.medicalReport.condition || "(Không có mô tả)"}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "center" }}>
          {getStatusIcon(record.status || "completed")}
          <ChevronRight size={18} color="#9ca3af" style={{ marginTop: 4 }} />
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
          backgroundColor: "#f9fafb",
          padding: 10,
          borderRadius: 10,
        }}
      >
        <Calendar size={16} color="#6b7280" style={{ marginRight: 8 }} />
        <Text style={{ color: "#374151", fontSize: 14, fontWeight: "500" }}>
          {dayjs(record.appointmentDate).format("DD/MM/YYYY HH:mm")}
        </Text>
      </View>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: "#6b7280", fontSize: 14, marginBottom: 4 }}>
          <Text style={{ fontWeight: "600", color: "#374151" }}>Bác sĩ: </Text>
          {record.doctor?.name || "Không rõ"}
        </Text>
        <Text style={{ color: "#6b7280", fontSize: 14 }}>
          <Text style={{ fontWeight: "600", color: "#374151" }}>
            Điều trị:{" "}
          </Text>
          {record.medicalReport.treatmentMethod || "-"}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <View
          style={{
            backgroundColor: getStatusColor(record.status || "completed") + "15",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: getStatusColor(record.status || "completed") + "40",
          }}
        >
          <Text
            style={{
              color: getStatusColor(record.status || "completed"),
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            {getStatusText(record.status || "completed")}
          </Text>
        </View>
        {record.medicalReport.prescription?.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fef3c7",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Pill size={14} color="#f59e0b" />
            <Text
              style={{
                marginLeft: 4,
                fontSize: 12,
                color: "#92400e",
                fontWeight: "600",
              }}
            >
              {record.medicalReport.prescription.length} thuốc
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const PrescriptionCard = ({
    prescription,
  }: {
    prescription: Prescription;
  }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedPrescription(prescription);
        setPrescriptionModalVisible(true);
      }}
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            backgroundColor: "#fef3c7",
            padding: 10,
            borderRadius: 12,
            marginRight: 12,
          }}
        >
          <Pill size={22} color="#f59e0b" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "700",
              fontSize: 17,
              color: "#111827",
              marginBottom: 4,
            }}
          >
            {prescription.medication}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {getStatusIcon(prescription.status)}
            <Text
              style={{
                marginLeft: 6,
                color: getStatusColor(prescription.status),
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {getStatusText(prescription.status)}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          backgroundColor: "#f9fafb",
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        {prescription.dosage && (
          <View style={{ flexDirection: "row", marginBottom: 6 }}>
            <Text style={{ color: "#6b7280", fontSize: 14, width: 90 }}>
              Liều dùng:
            </Text>
            <Text
              style={{
                color: "#111827",
                fontSize: 14,
                fontWeight: "600",
                flex: 1,
              }}
            >
              {prescription.dosage}
            </Text>
          </View>
        )}
        {prescription.duration && (
          <View style={{ flexDirection: "row" }}>
            <Text style={{ color: "#6b7280", fontSize: 14, width: 90 }}>
              Thời gian:
            </Text>
            <Text
              style={{
                color: "#111827",
                fontSize: 14,
                fontWeight: "600",
                flex: 1,
              }}
            >
              {prescription.duration}
            </Text>
          </View>
        )}
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <User size={14} color="#6b7280" style={{ marginRight: 6 }} />
          <Text style={{ color: "#6b7280", fontSize: 13 }}>
            BS. {prescription.doctor}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Calendar size={14} color="#6b7280" style={{ marginRight: 4 }} />
          <Text style={{ color: "#6b7280", fontSize: 13 }}>
            {prescription.date}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const TestCard = ({ test }: { test: TestResult }) => (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: getStatusColor(test.status),
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            backgroundColor:
              test.status === "normal" ? "#dcfce7" : test.status === "abnormal" ? "#fee2e2" : "#fef3c7",
            padding: 10,
            borderRadius: 12,
            marginRight: 12,
          }}
        >
          <Activity size={22} color={getStatusColor(test.status)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "700",
              fontSize: 17,
              color: "#111827",
              marginBottom: 4,
            }}
          >
            {test.testName}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {getStatusIcon(test.status)}
            <Text
              style={{
                marginLeft: 6,
                color: getStatusColor(test.status),
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {getStatusText(test.status)}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          backgroundColor: "#f9fafb",
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          <Text style={{ color: "#6b7280", fontSize: 14, width: 110 }}>
            Kết quả:
          </Text>
          <Text
            style={{
              color: "#111827",
              fontSize: 14,
              fontWeight: "600",
              flex: 1,
            }}
          >
            {test.result}
          </Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ color: "#6b7280", fontSize: 14, width: 110 }}>
            Giá trị bình thường:
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 14, flex: 1 }}>
            {test.normalRange}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <User size={14} color="#6b7280" style={{ marginRight: 6 }} />
          <Text style={{ color: "#6b7280", fontSize: 13 }}>
            BS. {test.doctor}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Calendar size={14} color="#6b7280" style={{ marginRight: 4 }} />
          <Text style={{ color: "#6b7280", fontSize: 13 }}>{test.date}</Text>
        </View>
      </View>
    </View>
  );

  const EmptyState = ({ icon, message }: { icon: any; message: string }) => (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
      }}
    >
      <View
        style={{
          backgroundColor: "#f3f4f6",
          padding: 24,
          borderRadius: 100,
          marginBottom: 20,
        }}
      >
        {React.cloneElement(icon, { size: 48, color: "#9ca3af" })}
      </View>
      <Text
        style={{
          color: "#6b7280",
          fontSize: 16,
          textAlign: "center",
          paddingHorizontal: 40,
        }}
      >
        {message}
      </Text>
    </View>
  );

  const activePrescriptions = prescriptions.filter(p => p.status === "active");

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0891b2" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#0891b2",
          paddingTop: StatusBar.currentHeight || 14,
          paddingHorizontal: 16,
          paddingBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
            Hồ sơ sức khỏe
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 12,
              padding: 10,
            }}
          >
            <Plus size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: 12,
            paddingHorizontal: 14,
            height: 48,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Search size={18} color="#6b7280" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, fontSize: 15, color: "#111827" }}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={18} color="#6b7280" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setFilterModalVisible(true)}
              style={{ marginLeft: 8 }}
            >
              <Filter size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <TabButton
          tab="records"
          label="Hồ sơ"
          icon={<FileText />}
          count={reports.length}
        />
        <TabButton
          tab="prescriptions"
          label="Đơn thuốc"
          icon={<Pill />}
          count={activePrescriptions.length}
        />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0891b2"]} />
        }
      >
        {activeTab === "records" && (
          <>
            {loading ? (
              <EmptyState
                icon={<Clock />}
                message="Đang tải báo cáo khám bệnh..."
              />
            ) : error ? (
              <EmptyState icon={<AlertCircle />} message={error} />
            ) : filteredRecords.length === 0 ? (
              <EmptyState
                icon={<FileText />}
                message={
                  searchQuery
                    ? "Không tìm thấy báo cáo phù hợp"
                    : "Chưa có báo cáo khám bệnh"
                }
              />
            ) : (
              filteredRecords.map((record) => (
                <RecordCard key={record.appointmentId} record={record} />
              ))
            )}
          </>
        )}

        {activeTab === "prescriptions" && (
          <>
            {filteredPrescriptions.length === 0 ? (
              <EmptyState
                icon={<Pill />}
                message={
                  searchQuery
                    ? "Không tìm thấy đơn thuốc phù hợp"
                    : "Chưa có đơn thuốc nào"
                }
              />
            ) : (
              filteredPrescriptions.map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                />
              ))
            )}
          </>
        )}

        {activeTab === "tests" && (
          <>
            {filteredTests.length === 0 ? (
              <EmptyState
                icon={<Activity />}
                message={
                  searchQuery
                    ? "Không tìm thấy kết quả xét nghiệm phù hợp"
                    : "Chưa có kết quả xét nghiệm"
                }
              />
            ) : (
              filteredTests.map((test) => <TestCard key={test.id} test={test} />)
            )}
          </>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity activeOpacity={1}>
            <View
              style={{
                backgroundColor: "white",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 24,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                  Lọc theo trạng thái
                </Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {["all", "completed", "ongoing", "scheduled"].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => {
                    setSelectedFilter(filter);
                    setFilterModalVisible(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f3f4f6",
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor:
                        selectedFilter === filter ? "#0891b2" : "#d1d5db",
                      backgroundColor:
                        selectedFilter === filter ? "#0891b2" : "transparent",
                      marginRight: 14,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selectedFilter === filter && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "white",
                        }}
                      />
                    )}
                  </View>
                  <Text style={{ fontSize: 16, color: "#111827" }}>
                    {filter === "all"
                      ? "Tất cả"
                      : filter === "completed"
                      ? "Hoàn thành"
                      : filter === "ongoing"
                      ? "Đang điều trị"
                      : "Đã lên lịch"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Detail Modal - Medical Record */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "90%",
            }}
          >
            {selectedRecord && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f3f4f6",
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: "bold", flex: 1 }}>
                    Chi tiết báo cáo
                  </Text>
                  <TouchableOpacity
                    onPress={() => setDetailModalVisible(false)}
                  >
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ padding: 20 }}>
                  {/* Doctor Info */}
                  <View
                    style={{
                      backgroundColor: "#f0fdf4",
                      padding: 16,
                      borderRadius: 16,
                      marginBottom: 16,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#059669",
                          padding: 10,
                          borderRadius: 12,
                          marginRight: 12,
                        }}
                      >
                        <User size={20} color="white" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            marginBottom: 2,
                          }}
                        >
                          Bác sĩ điều trị
                        </Text>
                        <Text
                          style={{
                            fontSize: 17,
                            fontWeight: "700",
                            color: "#111827",
                          }}
                        >
                          {selectedRecord.doctor?.name || "Không rõ"}
                        </Text>
                      </View>
                    </View>
                    {selectedRecord.doctor?.phoneNumber && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <Phone size={14} color="#6b7280" />
                        <Text
                          style={{
                            marginLeft: 8,
                            color: "#374151",
                            fontSize: 14,
                          }}
                        >
                          {selectedRecord.doctor.phoneNumber}
                        </Text>
                      </View>
                    )}
                    {selectedRecord.doctor?.email && (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Mail size={14} color="#6b7280" />
                        <Text
                          style={{
                            marginLeft: 8,
                            color: "#374151",
                            fontSize: 14,
                          }}
                        >
                          {selectedRecord.doctor.email}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Appointment Date */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: 6,
                        fontWeight: "600",
                      }}
                    >
                      NGÀY KHÁM
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#f9fafb",
                        padding: 14,
                        borderRadius: 12,
                      }}
                    >
                      <Calendar size={18} color="#059669" />
                      <Text
                        style={{
                          marginLeft: 10,
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {dayjs(selectedRecord.appointmentDate).format(
                          "DD/MM/YYYY HH:mm"
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* Condition */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: 6,
                        fontWeight: "600",
                      }}
                    >
                      TÌNH TRẠNG BỆNH
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: 14,
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ fontSize: 15, color: "#111827", lineHeight: 22 }}>
                        {selectedRecord.medicalReport.condition}
                      </Text>
                    </View>
                  </View>

                  {/* Treatment Method */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: 6,
                        fontWeight: "600",
                      }}
                    >
                      PHƯƠNG PHÁP ĐIỀU TRỊ
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: 14,
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ fontSize: 15, color: "#111827", lineHeight: 22 }}>
                        {selectedRecord.medicalReport.treatmentMethod}
                      </Text>
                    </View>
                  </View>

                  {/* Prescription */}
                  {selectedRecord.medicalReport.prescription?.length > 0 && (
                    <View style={{ marginBottom: 16 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          marginBottom: 6,
                          fontWeight: "600",
                        }}
                      >
                        ĐƠN THUỐC
                      </Text>
                      {selectedRecord.medicalReport.prescription.map(
                        (p, idx) => (
                          <View
                            key={idx}
                            style={{
                              backgroundColor: "#fef3c7",
                              padding: 14,
                              borderRadius: 12,
                              marginBottom: 8,
                              borderLeftWidth: 3,
                              borderLeftColor: "#f59e0b",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 8,
                              }}
                            >
                              <Pill size={16} color="#f59e0b" />
                              <Text
                                style={{
                                  marginLeft: 8,
                                  fontSize: 16,
                                  fontWeight: "700",
                                  color: "#111827",
                                }}
                              >
                                {p.medicine || "(Không rõ)"}
                              </Text>
                            </View>
                            {p.dosage && (
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: "#374151",
                                  marginBottom: 4,
                                }}
                              >
                                <Text style={{ fontWeight: "600" }}>
                                  Liều dùng:{" "}
                                </Text>
                                {p.dosage}
                              </Text>
                            )}
                            {p.duration && (
                              <Text style={{ fontSize: 14, color: "#374151" }}>
                                <Text style={{ fontWeight: "600" }}>
                                  Thời gian:{" "}
                                </Text>
                                {p.duration}
                              </Text>
                            )}
                          </View>
                        )
                      )}
                    </View>
                  )}

                  {/* Notes */}
                  {selectedRecord.medicalReport.notes && (
                    <View style={{ marginBottom: 16 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          marginBottom: 6,
                          fontWeight: "600",
                        }}
                      >
                        GHI CHÚ
                      </Text>
                      <View
                        style={{
                          backgroundColor: "#fef3c7",
                          padding: 14,
                          borderRadius: 12,
                        }}
                      >
                        <Text style={{ fontSize: 15, color: "#111827", lineHeight: 22 }}>
                          {selectedRecord.medicalReport.notes}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Timestamps */}
                  <View
                    style={{
                      backgroundColor: "#f9fafb",
                      padding: 14,
                      borderRadius: 12,
                      marginBottom: 20,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                      <Text style={{ fontWeight: "600" }}>Báo cáo tạo: </Text>
                      {selectedRecord.medicalReport.createdAt
                        ? dayjs(selectedRecord.medicalReport.createdAt).format(
                            "DD/MM/YYYY HH:mm"
                          )
                        : "-"}
                    </Text>
                    <Text style={{ fontSize: 13, color: "#6b7280" }}>
                      <Text style={{ fontWeight: "600" }}>Cập nhật: </Text>
                      {selectedRecord.medicalReport.updatedAt
                        ? dayjs(selectedRecord.medicalReport.updatedAt).format(
                            "DD/MM/YYYY HH:mm"
                          )
                        : "-"}
                    </Text>
                  </View>
                </ScrollView>

                <View style={{ padding: 20, paddingTop: 12 }}>
                  <TouchableOpacity
                    onPress={() => setDetailModalVisible(false)}
                    style={{
                      backgroundColor: "#0891b2",
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                    >
                      Đóng
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Prescription Detail Modal */}
      <Modal
        visible={prescriptionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPrescriptionModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "70%",
            }}
          >
            {selectedPrescription && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f3f4f6",
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: "bold", flex: 1 }}>
                    Chi tiết đơn thuốc
                  </Text>
                  <TouchableOpacity
                    onPress={() => setPrescriptionModalVisible(false)}
                  >
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ padding: 20 }}>
                  <View
                    style={{
                      backgroundColor: "#fef3c7",
                      padding: 18,
                      borderRadius: 16,
                      marginBottom: 20,
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#f59e0b",
                        padding: 14,
                        borderRadius: 16,
                        marginBottom: 12,
                      }}
                    >
                      <Pill size={32} color="white" />
                    </View>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#111827",
                        textAlign: "center",
                      }}
                    >
                      {selectedPrescription.medication}
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: "#f9fafb",
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 16,
                    }}
                  >
                    {selectedPrescription.dosage && (
                      <View
                        style={{
                          flexDirection: "row",
                          paddingVertical: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: "#e5e7eb",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#6b7280",
                            width: 100,
                            fontWeight: "600",
                          }}
                        >
                          Liều dùng
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#111827",
                            flex: 1,
                            fontWeight: "600",
                          }}
                        >
                          {selectedPrescription.dosage}
                        </Text>
                      </View>
                    )}
                    {selectedPrescription.duration && (
                      <View
                        style={{
                          flexDirection: "row",
                          paddingVertical: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: "#e5e7eb",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#6b7280",
                            width: 100,
                            fontWeight: "600",
                          }}
                        >
                          Thời gian
                        </Text>
                        <Text
                          style={{ fontSize: 14, color: "#111827", flex: 1 }}
                        >
                          {selectedPrescription.duration}
                        </Text>
                      </View>
                    )}
                    <View
                      style={{
                        flexDirection: "row",
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: "#e5e7eb",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#6b7280",
                          width: 100,
                          fontWeight: "600",
                        }}
                      >
                        Bác sĩ
                      </Text>
                      <Text
                        style={{ fontSize: 14, color: "#111827", flex: 1 }}
                      >
                        BS. {selectedPrescription.doctor}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", paddingVertical: 10 }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#6b7280",
                          width: 100,
                          fontWeight: "600",
                        }}
                      >
                        Ngày kê đơn
                      </Text>
                      <Text
                        style={{ fontSize: 14, color: "#111827", flex: 1 }}
                      >
                        {selectedPrescription.date}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        getStatusColor(selectedPrescription.status) + "15",
                      padding: 12,
                      borderRadius: 12,
                      marginBottom: 20,
                    }}
                  >
                    {getStatusIcon(selectedPrescription.status)}
                    <Text
                      style={{
                        marginLeft: 8,
                        fontSize: 15,
                        fontWeight: "600",
                        color: getStatusColor(selectedPrescription.status),
                      }}
                    >
                      {getStatusText(selectedPrescription.status)}
                    </Text>
                  </View>
                </ScrollView>

                <View style={{ padding: 20, paddingTop: 12 }}>
                  <TouchableOpacity
                    onPress={() => setPrescriptionModalVisible(false)}
                    style={{
                      backgroundColor: "#0891b2",
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                    >
                      Đóng
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}