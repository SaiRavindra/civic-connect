// screens/ManageAlertsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import API from "../utils/api";

const ManageAlertsScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      const response = await API.get("/alerts/all");
      setAlerts(response.data.data);
    } catch (err) {
      console.error("❌ Error fetching alerts:", err);
      Alert.alert("Error", "Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this alert?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/alerts/${id}`);
            Alert.alert("✅ Deleted", "Alert deleted successfully");
            fetchAlerts();
          } catch (err) {
            console.error("❌ Delete failed:", err);
            Alert.alert("Error", "Failed to delete alert");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1672ce" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚙️ Manage Alerts</Text>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.alertCard}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>Type: {item.alertType}</Text>
            <Text>Location: {item.location}</Text>
            <Text>Urgency: {item.urgency}</Text>
            <Text>Date: {new Date(item.createdAt).toLocaleString()}</Text>
            <Text style={styles.message}>{item.message}</Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item._id)}
            >
              <Text style={styles.deleteText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No alerts available</Text>}
      />
    </View>
  );
};

export default ManageAlertsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8fafc" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1672ce",
    marginBottom: 16,
    textAlign: "center",
  },
  alertCard: {
    backgroundColor: "#e5e7eb",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: { fontWeight: "bold", fontSize: 18, marginBottom: 6 },
  message: { marginTop: 6, color: "#111827" },
  deleteButton: {
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  deleteText: { color: "white", fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#6b7280" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
