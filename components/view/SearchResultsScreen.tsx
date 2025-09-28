import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getRandomDoctors, getDoctors } from "../../services/DoctorService"; // Adjust path to your service file

const specialties = ["Tất cả", "Nội khoa", "Tim mạch", "Da liễu", "Nhi khoa"];

export default function EnhancedDoctorSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tất cả");
  const [favorites, setFavorites] = useState(new Set());
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDoctors = async (query = "", specialty = "Tất cả") => {
    setLoading(true);
    setError(null);
    try {
      const hasSearchParams = query.trim() || specialty !== "Tất cả";

      if (hasSearchParams) {
        const params = {};
        if (query.trim()) params.name = query.trim(); 
        if (specialty !== "Tất cả") params.specialty = specialty;

        const response = await getDoctors(params);
        setDoctors(response.data);
      } else {
        const response = await getRandomDoctors();
        setDoctors(response.data);
      }
    } catch (err) {
      setError("Không thể tải danh sách bác sĩ. Vui lòng thử lại.");
      Alert.alert("Lỗi", "Không thể tải danh sách bác sĩ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchDoctors(searchQuery, selectedSpecialty);
  }, [selectedSpecialty]);

  // Handle search
  const handleSearch = () => {
    fetchDoctors(searchQuery, selectedSpecialty);
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

  const renderSpecialtyTab = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedSpecialty(item)}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor:
          selectedSpecialty === item ? "white" : "rgba(255,255,255,0.15)",
        shadowColor: selectedSpecialty === item ? "#000" : "transparent",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: selectedSpecialty === item ? 2 : 0,
      }}
    >
      <Text
        style={{
          color: selectedSpecialty === item ? "#2563eb" : "white",
          fontSize: 14,
          fontWeight: selectedSpecialty === item ? "600" : "500",
        }}
      >
        {item}
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
      {item.isOnline && (
        <View
          style={{
            backgroundColor: "#10b981",
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: "white",
                borderRadius: 4,
                marginRight: 8,
              }}
            />
            <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
              🟢 Đang hoạt động - {item.responseTime}
            </Text>
          </View>
        </View>
      )}

      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ position: "relative", marginRight: 16 }}>
            <Image
              source={{ uri: item.image }}
              style={{
                width: 68,
                height: 68,
                borderRadius: 16,
                borderWidth: 3,
                borderColor: "#dbeafe",
              }}
            />
            {item.verified && (
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 22,
                  height: 22,
                  backgroundColor: "#2563eb",
                  borderRadius: 11,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "white",
                }}
              >
                <Ionicons name="checkmark" size={14} color="white" />
              </View>
            )}
            {item.isOnline && (
              <View
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 18,
                  height: 18,
                  backgroundColor: "#10b981",
                  borderRadius: 9,
                  borderWidth: 3,
                  borderColor: "white",
                }}
              />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#111827",
                    marginBottom: 6,
                  }}
                >
                  {item.name}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#dbeafe",
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 12,
                      marginRight: 8,
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#1d4ed8",
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {item.specialty}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: 13,
                      fontWeight: "500",
                    }}
                  >
                    • {item.experience}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => toggleFavorite(item._id)}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: favorites.has(item.id)
                    ? "#fee2e2"
                    : "#f3f4f6",
                }}
              >
                <Ionicons
                  name={favorites.has(item.id) ? "heart" : "heart-outline"}
                  size={20}
                  color={favorites.has(item.id) ? "#ef4444" : "#9ca3af"}
                />
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

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  marginLeft: 6,
                  flex: 1,
                }}
                numberOfLines={2}
              >
                {item.clinic}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
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

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="globe-outline" size={16} color="#6b7280" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginLeft: 8, flex: 1 }}
                contentContainerStyle={{ alignItems: "center" }}
              >
                <View style={{ flexDirection: "row" }}>
                  {(Array.isArray(item.languages) ? item.languages : []).map(
                    (lang) => (
                      <View
                        key={lang}
                        style={{
                          backgroundColor: "#f8fafc",
                          borderWidth: 1,
                          borderColor: "#e2e8f0",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          marginRight: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: "#64748b",
                            fontSize: 11,
                            fontWeight: "500",
                          }}
                        >
                          {lang}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </ScrollView>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 20,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#f3f4f6",
                      padding: 6,
                      borderRadius: 8,
                      marginRight: 6,
                    }}
                  >
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#6b7280"
                    />
                  </View>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: 13,
                      fontWeight: "500",
                    }}
                  >
                    {item.distance}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      backgroundColor: "#dcfce7",
                      padding: 6,
                      borderRadius: 8,
                      marginRight: 6,
                    }}
                  >
                    <Ionicons name="time-outline" size={14} color="#16a34a" />
                  </View>
                  <Text
                    style={{
                      color: "#16a34a",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {item.nextSlot}
                  </Text>
                </View>
              </View>
              <Text
                style={{ fontSize: 19, fontWeight: "bold", color: "#2563eb" }}
              >
                {item.price}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              {Array.isArray(item.consultationType) &&
                item.consultationType.includes("Video call") && (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: "#2563eb",
                      paddingVertical: 14,
                      borderRadius: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#2563eb",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Ionicons name="videocam" size={18} color="white" />
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "600",
                        marginLeft: 8,
                        fontSize: 14,
                      }}
                    >
                      Tư vấn online
                    </Text>
                  </TouchableOpacity>
                )}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#f8fafc",
                  borderWidth: 1.5,
                  borderColor: "#e2e8f0",
                  paddingVertical: 14,
                  borderRadius: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="calendar-outline" size={18} color="#374151" />
                <Text
                  style={{
                    color: "#374151",
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
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />

      <View
        style={{
          backgroundColor: "#2563eb",
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            style={{
              padding: 10,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.15)",
              marginRight: 12,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

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
          keyExtractor={(item) => item}
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
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : error ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#ef4444", fontSize: 16 }}>
            Đã xảy ra lỗi: {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchDoctors(searchQuery, selectedSpecialty)}
            style={{
              marginTop: 16,
              backgroundColor: "#2563eb",
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
        <View style={{ position: "absolute", bottom: 30, left: 16, right: 16 }}>
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
            onPress={() => fetchDoctors("", "Tất cả")}
          >
            <Text style={{ color: "#374151", fontWeight: "600", fontSize: 16 }}>
              Xem thêm kết quả
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
