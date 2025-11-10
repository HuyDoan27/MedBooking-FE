import {
  getDoctors,
  getDoctorsBySpecialty,
  getRandomDoctors,
} from "@/services/DoctorService";
import { getSpecialty } from "@/services/SpecialtyService";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import CreateAppointmentModal from "../Appointments/components/CreateAppointmentModal";
import { getUserAppointments } from "@/services/AppointmentService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EnhancedDoctorSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialties, setSpecialties] = useState([
    { _id: "all", name: "Tất cả" },
  ]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [favorites, setFavorites] = useState(new Set());
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch specialties from API
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await getSpecialty();
        if (Array.isArray(res.data.data)) {
          setSpecialties([{ _id: "all", name: "Tất cả" }, ...res.data.data]);
        } else {
          setSpecialties([{ _id: "all", name: "Tất cả" }]);
        }
      } catch {
        setSpecialties([{ _id: "all", name: "Tất cả" }]);
      }
    };
    fetchSpecialties();
  }, []);

  // Lấy ngẫu nhiên bác sĩ khi vào màn hình
  const fetchRandomDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRandomDoctors();
      setDoctors(response.data.data || []);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách bác sĩ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Lọc theo chuyên khoa
  const fetchDoctorsBySpecialty = async (specialtyId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDoctorsBySpecialty({ specialtyId });
      setDoctors(response.data.data || []);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách bác sĩ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm theo tên bác sĩ
  const fetchDoctorsByName = async (name) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDoctors({ name });
      setDoctors(response.data.data || []);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách bác sĩ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const userJson = await AsyncStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserId(user._id);

        const params = {
          status: "upcoming",
          page: 1,
          limit: 10,
        };
        const response = await getUserAppointments(user._id, params);
        setAppointments(response.data.data);
      }
    } catch (err) {
      setError("Không thể tải danh sách lịch hẹn. Vui lòng thử lại.");
      console.error("Error loading:", err);
    } finally {
      setLoading(false);
    }
  };

  // Khi vào màn hình, gọi getRandomDoctors
  useEffect(() => {
    fetchRandomDoctors();
  }, []);

  // Khi filter chuyên khoa
  useEffect(() => {
    if (!isSearching) {
      if (selectedSpecialty === "all") {
        fetchRandomDoctors();
      } else {
        fetchDoctorsBySpecialty(selectedSpecialty);
      }
    }
  }, [selectedSpecialty, isSearching]);

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      fetchDoctorsByName(searchQuery.trim());
    } else {
      setIsSearching(false);
      fetchRandomDoctors();
    }
  };

  const toggleFavorite = (doctorId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(doctorId)) {
      newFavorites.delete(doctorId);
    } else {
      newFavorites.add(doctorId);
    }
    setFavorites(newFavorites);
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const renderSpecialtyTab = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedSpecialty(item._id);
        setSearchQuery("");
        setIsSearching(false);
      }}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor:
          selectedSpecialty === item._id ? "white" : "rgba(255,255,255,0.15)",
        shadowColor: selectedSpecialty === item._id ? "#000" : "transparent",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: selectedSpecialty === item._id ? 2 : 0,
      }}
    >
      <Text
        style={{
          color: selectedSpecialty === item._id ? "#0891b2" : "white",
          fontSize: 14,
          fontWeight: selectedSpecialty === item._id ? "600" : "500",
        }}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderDoctorCard = ({ item }) => (
    <View
      style={{
        backgroundColor: "white",
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: "hidden",
      }}
    >
      <View style={{ padding: 20 }}>
        {/* Dòng 1: Ảnh, Thông tin, Icons */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          {/* Ảnh */}
          <Image
            source={{ uri: item.image }}
            style={{
              width: 68,
              height: 68,
              borderRadius: 16,
              borderWidth: 3,
              borderColor: "#dbeafe",
              marginRight: 12,
            }}
          />

          {/* Thông tin: Họ tên và kinh nghiệm */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#111827",
                marginTop: 10,
              }}
            >
              {item.fullName}
            </Text>
            <Text
              style={{
                color: "#6b7280",
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              {item.experience} Kinh nghiệm
            </Text>
          </View>

          {/* Icons mắt và tim */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => toggleFavorite(item._id)}
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: "#f3f4f6",
              }}
            >
              <Ionicons name="eye" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleFavorite(item._id)}
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: favorites.has(item._id)
                  ? "#fee2e2"
                  : "#f3f4f6",
              }}
            >
              <Ionicons
                name={favorites.has(item._id) ? "heart" : "heart-outline"}
                size={20}
                color={favorites.has(item._id) ? "#ef4444" : "#9ca3af"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dòng 2: Tên phòng khám */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Ionicons name="home" size={16} color="#6b7280" />
          <Text
            style={{
              color: "#6b7280",
              fontSize: 13,
              marginLeft: 8,
              flex: 1,
            }}
            numberOfLines={2}
          >
            {item.clinicName}
          </Text>
        </View>

        {/* Dòng 3: Địa chỉ và giờ khám tiếp theo */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            gap: 8,
          }}
        >
          <View
            style={{
              backgroundColor: "#f3f4f6",
              padding: 6,
              borderRadius: 8,
            }}
          >
            <Ionicons name="location-outline" size={14} color="#6b7280" />
          </View>
          <Text
            style={{
              color: "#6b7280",
              fontSize: 13,
              fontWeight: "500",
              flex: 1,
            }}
          >
            {item.clinicAddress}
          </Text>
        </View>

        {/* Dòng 5: Đánh giá sao */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", marginRight: 8 }}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={16}
                color={i < Math.floor(item.rating) ? "#f59e0b" : "#e5e7eb"}
              />
            ))}
          </View>
          <Text
            style={{
              fontWeight: "700",
              color: "#111827",
              fontSize: 15,
              marginRight: 4,
            }}
          >
            {item.rating}
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 13 }}>
            ({item.reviews} đánh giá)
          </Text>
        </View>

        {/* Dòng 6: Nút đặt lịch */}
        <TouchableOpacity
          onPress={() => handleBookAppointment(item)}
          style={{
            backgroundColor: "#0891b2",
            paddingVertical: 14,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="calendar-outline" size={18} color="white" />
          <Text
            style={{
              color: "white",
              fontWeight: "600",
              marginLeft: 8,
              fontSize: 14,
            }}
          >
            Đặt lịch
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View
        style={{
          backgroundColor: "#0891b2",
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderEndEndRadius: 16,
          borderEndStartRadius: 16,
          paddingTop: 50,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 14,
              paddingHorizontal: 14,
              marginRight: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              placeholder="Tìm bác sĩ, chuyên khoa..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              style={{
                flex: 1,
                marginLeft: 10,
                paddingVertical: 14,
                fontSize: 16,
                color: "#111827",
              }}
            />
          </View>

          <TouchableOpacity
            style={{
              padding: 10,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.15)",
            }}
          >
            <Ionicons name="options" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={specialties}
          renderItem={renderSpecialtyTab}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        />
      </View>

      <View
        style={{
          backgroundColor: "white",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#f1f5f9",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#64748b", fontSize: 15 }}>
          Tìm thấy{" "}
          <Text style={{ fontWeight: "700", color: "#111827" }}>
            {doctors.length}
          </Text>{" "}
          bác sĩ
        </Text>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f8fafc",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: "#475569",
              fontSize: 14,
              marginRight: 6,
              fontWeight: "500",
            }}
          >
            Sắp xếp
          </Text>
          <Ionicons name="chevron-down" size={16} color="#475569" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#0891b2" />
        </View>
      ) : error ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#ef4444", fontSize: 16 }}>
            Đã xảy ra lỗi: {error}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (searchQuery.trim()) {
                fetchDoctorsByName(searchQuery.trim());
              } else {
                fetchRandomDoctors();
              }
            }}
            style={{
              marginTop: 16,
              backgroundColor: "#0891b2",
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={doctors}
          renderItem={renderDoctorCard}
          keyExtractor={(item) =>
            item?._id ? item._id.toString() : Math.random().toString()
          }
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!loading && !error && doctors.length > 0 && (
        <View>
          <TouchableOpacity
            style={{
              backgroundColor: "white",
              paddingVertical: 16,
              borderRadius: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#e2e8f0",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
            onPress={fetchRandomDoctors}
          >
            <Text style={{ color: "#374151", fontWeight: "600", fontSize: 16 }}>
              Xem thêm kết quả khác
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <CreateAppointmentModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        onSuccess={loadAppointments}
      />
    </SafeAreaView>
  );
}
