import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from "../utils/api";

const ComplaintScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [issueType, setIssueType] = useState('');
  const [ward, setWard] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(''); // ✅ location dropdown state

  const handleSubmit = async () => {
    if (!name || !contact || !issueType || !ward || !description || !location) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const complaint = { name, contact, issueType, ward, description, location };

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'User not logged in.');
        return;
      }

      const response = await API.post('/complaints', complaint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('✅ Success', 'Complaint submitted successfully');
      navigation.goBack();
    } catch (error) {
      console.log('❌ Submission failed:', error?.response?.data || error.message);
      Alert.alert('Error', error?.response?.data?.reason || 'Failed to submit complaint');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Raise Complaint</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Contact</Text>
      <TextInput
        style={styles.input}
        value={contact}
        onChangeText={setContact}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Issue Type</Text>
      <Picker
        selectedValue={issueType}
        onValueChange={setIssueType}
        style={styles.picker}
      >
        <Picker.Item label="Select Issue Type" value="" />
        <Picker.Item label="Water" value="Water" />
        <Picker.Item label="Road" value="Road" />
        <Picker.Item label="Electricity" value="Electricity" />
      </Picker>

      <Text style={styles.label}>Ward</Text>
      <Picker
        selectedValue={ward}
        onValueChange={setWard}
        style={styles.picker}
      >
        <Picker.Item label="Select Ward" value="" />
        <Picker.Item label="Ward 1" value="Ward 1" />
        <Picker.Item label="Ward 2" value="Ward 2" />
        <Picker.Item label="Ward 3" value="Ward 3" />
        <Picker.Item label="Ward 4" value="Ward 4" />
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
      </Picker>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { minHeight: 100 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ComplaintScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 16, marginTop: 12 },
  input: { backgroundColor: '#e7edf3', borderRadius: 8, padding: 12, fontSize: 16 },
  picker: { backgroundColor: '#e7edf3', borderRadius: 8, marginTop: 8 },
  submitButton: {
    backgroundColor: '#1672ce',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

