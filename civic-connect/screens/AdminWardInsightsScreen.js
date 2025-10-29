import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import API from "../utils/api";

export default function AdminWardInsightsScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState("Ramnagar");

  const navigation = useNavigation();

  const fetchInsights = async (selectedLocation = location) => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get(
        `/insights/last-30-days?location=${selectedLocation}`
      );
      setData(response.data);
    } catch (err) {
      console.error("❌ Error fetching ward insights:", err);
      const message = err.response?.data?.message || "Failed to load insights";
      setError(message);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights("Ramnagar");
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Ward Insights (Last 30 Days)</Text>
      <Text style={styles.subheading}>
        Select a location to view ward-wise complaint data
      </Text>

      {/* Dropdown */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Select Location:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={location}
            onValueChange={(itemValue) => setLocation(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Ramnagar" value="Ramnagar" />
            <Picker.Item label="Srinagar" value="Srinagar" />
          </Picker>
        </View>
      </View>

      {/* Get Insights Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => fetchInsights(location)}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Get Insights"}
        </Text>
      </TouchableOpacity>

      {/* Detailed Chart Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#2e8b57" }]}
        onPress={() =>
          navigation.navigate("WardInsights", { selectedLocation: location })
        }
      >
        <Text style={styles.buttonText}>View Detailed Charts 📊</Text>
      </TouchableOpacity>

      {/* Loader */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1672ce" />
          <Text style={{ marginTop: 10 }}>Loading ward insights...</Text>
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <View style={styles.centered}>
          <Text style={{ color: "red" }}>⚠️ {error}</Text>
        </View>
      )}

      {/* Data */}
      {!loading && !error && data && data.wards && data.wards.length > 0 ? (
        data.wards.map((ward) => (
          <View key={ward.ward} style={styles.card}>
            <Text style={styles.cardTitle}>{ward.ward}</Text>
            <Text>Total Complaints: {ward.totalComplaints}</Text>
            <Text>
              Avg Severity: {ward.avgSeverityOverall?.toFixed(1) || "0.0"}
            </Text>
            <View style={{ marginTop: 8 }}>
              {ward.issues.map((i) => (
                <Text key={i.issueType}>
                  • {i.issueType} — {i.count} complaints (avg severity{" "}
                  {i.avgSeverity?.toFixed(1) || "0.0"})
                </Text>
              ))}
            </View>
          </View>
        ))
      ) : (
        !loading &&
        !error && (
          <Text style={styles.noDataText}>
            No data available for this location.
          </Text>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subheading: { color: "gray", marginBottom: 20, textAlign: "center" },
  dropdownContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  dropdownLabel: { fontSize: 16, marginBottom: 6, color: "#333" },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: { height: 50, width: "100%" },
  button: {
    backgroundColor: "#1672ce",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 5 },
  centered: { justifyContent: "center", alignItems: "center" },
  noDataText: {
    textAlign: "center",
    color: "gray",
    marginTop: 20,
    fontSize: 16,
  },
  newIssueBox: {
    marginTop: 10,
    backgroundColor: "#e6f7ff",
    padding: 8,
    borderRadius: 8,
  },
  newIssueText: { color: "#007acc", fontWeight: "500" },
});
