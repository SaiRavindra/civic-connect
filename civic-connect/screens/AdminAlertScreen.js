import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../utils/api";

const AdminAlertScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !message || !alertType || !location || !urgency) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    const alertData = { title, message, alertType, location, urgency };

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Authentication Error", "Admin not logged in.");
        return;
      }

      setLoading(true);
      await API.post("/alerts/create", alertData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("✅ Success", "Alert created successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("❌ Alert creation failed:", error?.response?.data || error.message);
      Alert.alert("Error", error?.response?.data?.reason || "Failed to create alert.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Create New Alert</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter alert title"
      />

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, { minHeight: 100 }]}
        value={message}
        onChangeText={setMessage}
        placeholder="Enter alert message"
        multiline
      />

      <Text style={styles.label}>Alert Type</Text>
      <Picker
        selectedValue={alertType}
        onValueChange={setAlertType}
        style={styles.picker}
      >
        <Picker.Item label="Select Alert Type" value="" />
        <Picker.Item label="Water" value="Water" />
        <Picker.Item label="Electricity" value="Electricity" />
        <Picker.Item label="Road" value="Road" />
        <Picker.Item label="Garbage" value="Garbage" />
        <Picker.Item label="Drainage" value="Drainage" />
        <Picker.Item label="General" value="General" />
      </Picker>

      <Text style={styles.label}>Location</Text>
      <Picker
        selectedValue={location}
        onValueChange={setLocation}
        style={styles.picker}
      >
        <Picker.Item label="Select Location" value="" />
        <Picker.Item label="Ramnagar" value="Ramnagar" />
        <Picker.Item label="Srinagar" value="Srinagar" />
        <Picker.Item label="All" value="All" />
      </Picker>

      <Text style={styles.label}>Urgency</Text>
      <Picker
        selectedValue={urgency}
        onValueChange={setUrgency}
        style={styles.picker}
      >
        <Picker.Item label="Select Urgency Level" value="" />
        <Picker.Item label="Low" value="Low" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="High" value="High" />
      </Picker>

      <TouchableOpacity
        style={[styles.submitButton, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? "Submitting..." : "Submit Alert"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AdminAlertScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8fafc" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  label: { fontSize: 16, marginTop: 12 },
  input: {
    backgroundColor: "#e7edf3",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  picker: {
    backgroundColor: "#e7edf3",
    borderRadius: 8,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: "#1672ce",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
