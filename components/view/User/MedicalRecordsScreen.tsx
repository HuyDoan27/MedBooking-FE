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
  User,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type TabType = "records" | "prescriptions" | "tests";

interface MedicalRecord {
  id: number;
  date: string;
  doctor: string;
  specialty: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  status: "completed" | "ongoing" | "scheduled";
  priority: "low" | "medium" | "high";
  notes?: string;
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
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Sample data
  const medicalRecords: MedicalRecord[] = [
    {
      id: 1,
      date: "2024-01-10",
      doctor: "BS. Lê Minh Cường",
      specialty: "Mắt",
      diagnosis: "Cận thị nhẹ",
      symptoms: "Mờ mắt, đau đầu",
      treatment: "Kính cận -1.5D",
      status: "completed",
      priority: "low",
      notes: "Tái khám sau 6 tháng",
    },
    {
      id: 2,
      date: "2024-02-15",
      doctor: "BS. Nguyễn Thị Lan",
      specialty: "Tim mạch",
      diagnosis: "Huyết áp cao nhẹ",
      symptoms: "Hoa mắt, mệt mỏi",
      treatment: "Thuốc hạ huyết áp, chế độ ăn",
      status: "ongoing",
      priority: "medium",
      notes: "Theo dõi huyết áp hàng ngày",
    },
    {
      id: 3,
      date: "2024-03-20",
      doctor: "BS. Trần Văn Hùng",
      specialty: "Tiêu hóa",
      diagnosis: "Viêm dạ dày",
      symptoms: "Đau bụng, buồn nôn",
      treatment: "Thuốc kháng acid, chế độ ăn",
      status: "completed",
      priority: "medium",
    },
  ];

  const prescriptions: Prescription[] = [
    {
      id: 1,
      date: "2024-02-15",
      doctor: "BS. Nguyễn Thị Lan",
      medication: "Losartan",
      dosage: "50mg",
      frequency: "1 lần/ngày",
      duration: "3 tháng",
      status: "active",
    },
    {
      id: 2,
      date: "2024-01-10",
      doctor: "BS. Lê Minh Cường",
      medication: "Vitamin A",
      dosage: "5000 IU",
      frequency: "1 lần/ngày",
      duration: "1 tháng",
      status: "completed",
    },
  ];

  const testResults: TestResult[] = [
    {
      id: 1,
      date: "2024-02-10",
      testName: "Xét nghiệm máu tổng quát",
      result: "Bình thường",
      normalRange: "Trong giới hạn bình thường",
      status: "normal",
      doctor: "BS. Nguyễn Thị Lan",
    },
    {
      id: 2,
      date: "2024-03-15",
      testName: "X-quang ngực",
      result: "Phổi sạch",
      normalRange: "Không có bất thường",
      status: "normal",
      doctor: "BS. Trần Văn Hùng",
    },
  ];

  // Filter and search functionality
  const filteredRecords = useMemo(() => {
    let filtered = medicalRecords;

    if (selectedFilter !== "all") {
      filtered = filtered.filter((record) => record.status === selectedFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (record) =>
          record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, selectedFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
        return <CheckCircle size={16} color="#10b981" />;
      case "ongoing":
        return <Clock size={16} color="#f59e0b" />;
      case "scheduled":
        return <Calendar size={16} color="#3b82f6" />;
      case "normal":
        return <CheckCircle size={16} color="#10b981" />;
      case "abnormal":
        return <AlertCircle size={16} color="#ef4444" />;
      case "pending":
        return <Clock size={16} color="#f59e0b" />;
      default:
        return <AlertCircle size={16} color="#6b7280" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const TabButton = ({
    tab,
    label,
    icon,
  }: {
    tab: TabType;
    label: string;
    icon: any;
  }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={{
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 2,
        borderBottomColor: activeTab === tab ? "#059669" : "transparent",
      }}
    >
      {React.cloneElement(icon, {
        size: 20,
        color: activeTab === tab ? "#059669" : "#6b7280",
      })}
      <Text
        style={{
          fontSize: 12,
          fontWeight: activeTab === tab ? "600" : "normal",
          color: activeTab === tab ? "#059669" : "#6b7280",
          marginTop: 4,
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
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: getPriorityColor(record.priority),
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <FileText size={18} color="#059669" style={{ marginRight: 8 }} />
            <Text style={{ fontWeight: "bold", fontSize: 16, flex: 1 }}>
              {record.diagnosis}
            </Text>
            {getStatusIcon(record.status)}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Calendar size={14} color="#6b7280" style={{ marginRight: 4 }} />
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
              {record.date}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color="#6b7280" />
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <User size={14} color="#6b7280" style={{ marginRight: 4 }} />
        <Text style={{ color: "#374151", fontSize: 14 }}>
          {record.doctor} - {record.specialty}
        </Text>
      </View>

      <Text style={{ color: "#6b7280", fontSize: 14, marginBottom: 4 }}>
        <Text style={{ fontWeight: "500" }}>Triệu chứng:</Text>{" "}
        {record.symptoms}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            backgroundColor: getStatusColor(record.status) + "20",
            color: getStatusColor(record.status),
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            fontSize: 12,
            fontWeight: "500",
          }}
        >
          {record.status === "completed"
            ? "Hoàn thành"
            : record.status === "ongoing"
            ? "Đang điều trị"
            : "Đã lên lịch"}
        </Text>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: getPriorityColor(record.priority),
          }}
        />
      </View>
    </TouchableOpacity>
  );

  const PrescriptionCard = ({
    prescription,
  }: {
    prescription: Prescription;
  }) => (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Pill size={18} color="#059669" style={{ marginRight: 8 }} />
        <Text style={{ fontWeight: "bold", fontSize: 16, flex: 1 }}>
          {prescription.medication}
        </Text>
        {getStatusIcon(prescription.status)}
      </View>

      <View style={{ marginBottom: 8 }}>
        <Text style={{ color: "#374151", fontSize: 14, marginBottom: 2 }}>
          <Text style={{ fontWeight: "500" }}>Liều dùng:</Text>{" "}
          {prescription.dosage} - {prescription.frequency}
        </Text>
        <Text style={{ color: "#374151", fontSize: 14, marginBottom: 2 }}>
          <Text style={{ fontWeight: "500" }}>Thời gian:</Text>{" "}
          {prescription.duration}
        </Text>
        <Text style={{ color: "#6b7280", fontSize: 14 }}>
          BS. {prescription.doctor} - {prescription.date}
        </Text>
      </View>

      <Text
        style={{
          backgroundColor: getStatusColor(prescription.status) + "20",
          color: getStatusColor(prescription.status),
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          fontSize: 12,
          fontWeight: "500",
          alignSelf: "flex-start",
        }}
      >
        {prescription.status === "active"
          ? "Đang dùng"
          : prescription.status === "completed"
          ? "Đã hoàn thành"
          : "Hết hạn"}
      </Text>
    </View>
  );

  const TestCard = ({ test }: { test: TestResult }) => (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Activity size={18} color="#059669" style={{ marginRight: 8 }} />
        <Text style={{ fontWeight: "bold", fontSize: 16, flex: 1 }}>
          {test.testName}
        </Text>
        {getStatusIcon(test.status)}
      </View>

      <View style={{ marginBottom: 8 }}>
        <Text style={{ color: "#374151", fontSize: 14, marginBottom: 2 }}>
          <Text style={{ fontWeight: "500" }}>Kết quả:</Text> {test.result}
        </Text>
        <Text style={{ color: "#6b7280", fontSize: 14, marginBottom: 2 }}>
          <Text style={{ fontWeight: "500" }}>Giá trị bình thường:</Text>{" "}
          {test.normalRange}
        </Text>
        <Text style={{ color: "#6b7280", fontSize: 14 }}>
          BS. {test.doctor} - {test.date}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0891b2" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#0891b2",
          paddingTop: StatusBar.currentHeight || 14,
          paddingHorizontal: 16,
          paddingBottom: 16,
          borderBottomStartRadius: 16,
          borderBottomEndRadius: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
            Hồ sơ sức khỏe
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 8,
              padding: 8,
            }}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 8,
            marginTop: 16,
            paddingHorizontal: 12,
            height: 40,
          }}
        >
          <Search size={16} color="#6b7280" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Tìm kiếm hồ sơ..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, fontSize: 14 }}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            style={{ marginLeft: 8 }}
          >
            <Filter size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <TabButton tab="records" label="Hồ sơ" icon={<FileText />} />
        <TabButton tab="prescriptions" label="Đơn thuốc" icon={<Pill />} />
        <TabButton tab="tests" label="Xét nghiệm" icon={<Activity />} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === "records" && (
          <>
            {filteredRecords.length === 0 ? (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 40,
                }}
              >
                <FileText size={48} color="#d1d5db" />
                <Text style={{ color: "#6b7280", fontSize: 16, marginTop: 16 }}>
                  Không tìm thấy hồ sơ nào
                </Text>
              </View>
            ) : (
              filteredRecords.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))
            )}
          </>
        )}

        {activeTab === "prescriptions" && (
          <>
            {prescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
              />
            ))}
          </>
        )}

        {activeTab === "tests" && (
          <>
            {testResults.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
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
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}
            >
              Lọc theo trạng thái
            </Text>

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
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#f3f4f6",
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor:
                      selectedFilter === filter ? "#0891b2" : "#d1d5db",
                    backgroundColor:
                      selectedFilter === filter ? "#0891b2" : "transparent",
                    marginRight: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedFilter === filter && (
                    <CheckCircle size={12} color="white" />
                  )}
                </View>
                <Text style={{ fontSize: 16 }}>
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

            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={{
                backgroundColor: "#0891b2",
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
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
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 20,
              width: "100%",
              maxHeight: "80%",
            }}
          >
            {selectedRecord && (
              <ScrollView>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}
                >
                  Chi tiết hồ sơ
                </Text>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: "bold", color: "#374151" }}>
                    Chẩn đoán:
                  </Text>
                  <Text style={{ fontSize: 16, marginTop: 4 }}>
                    {selectedRecord.diagnosis}
                  </Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: "bold", color: "#374151" }}>
                    Bác sĩ:
                  </Text>
                  <Text style={{ fontSize: 16, marginTop: 4 }}>
                    {selectedRecord.doctor} - {selectedRecord.specialty}
                  </Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: "bold", color: "#374151" }}>
                    Ngày khám:
                  </Text>
                  <Text style={{ fontSize: 16, marginTop: 4 }}>
                    {selectedRecord.date}
                  </Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: "bold", color: "#374151" }}>
                    Triệu chứng:
                  </Text>
                  <Text style={{ fontSize: 16, marginTop: 4 }}>
                    {selectedRecord.symptoms}
                  </Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: "bold", color: "#374151" }}>
                    Điều trị:
                  </Text>
                  <Text style={{ fontSize: 16, marginTop: 4 }}>
                    {selectedRecord.treatment}
                  </Text>
                </View>

                {selectedRecord.notes && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontWeight: "bold", color: "#374151" }}>
                      Ghi chú:
                    </Text>
                    <Text style={{ fontSize: 16, marginTop: 4 }}>
                      {selectedRecord.notes}
                    </Text>
                  </View>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 16,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {getStatusIcon(selectedRecord.status)}
                    <Text
                      style={{
                        marginLeft: 8,
                        color: getStatusColor(selectedRecord.status),
                        fontWeight: "500",
                      }}
                    >
                      {selectedRecord.status === "completed"
                        ? "Hoàn thành"
                        : selectedRecord.status === "ongoing"
                        ? "Đang điều trị"
                        : "Đã lên lịch"}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: getPriorityColor(
                          selectedRecord.priority
                        ),
                        marginRight: 8,
                      }}
                    />
                    <Text
                      style={{
                        color: getPriorityColor(selectedRecord.priority),
                        fontWeight: "500",
                        fontSize: 12,
                      }}
                    >
                      {selectedRecord.priority === "high"
                        ? "Cao"
                        : selectedRecord.priority === "medium"
                        ? "Trung bình"
                        : "Thấp"}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={() => setDetailModalVisible(false)}
              style={{
                backgroundColor: "#0891b2",
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
