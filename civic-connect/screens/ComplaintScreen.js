// screens/ComplaintScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from "../utils/api"; // 🔄 Add this import at the top (already in your project)

 
const ComplaintScreen = ({ navigation }) => {

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // const handleSubmit = async () => {
  //   console.log('')
  //   if (!name || !contact || !issueType || !description || !location) {
  //   alert('Please fill in all required fields.');
  //   return;
  // }
  //   const complaint = { name, contact, issueType, description, location };

  //   try {
  //     const response = await fetch('http://10.102.46.225:5000/complaints', { // <-- Replace with your local IP!
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(complaint),
  //     });

  //     if (response.ok) {
  //       Alert.alert('Success', 'Complaint submitted successfully');
  //       navigation.goBack();
  //     } else {
  //       Alert.alert('Error', 'Failed to submit complaint');
  //     }
  //   } catch (error) {
  //     Alert.alert('Network Error', error.message);
  //   }
  // };
  // const handleSubmit = async () => {
  // if (!name || !contact || !issueType || !description || !location) {
  //   Alert.alert('Validation Error', 'Please fill in all required fields.');
  //   return;
  // }

  // const complaint = { name, contact, issueType, description, location };

  // try {
  //   const token = await AsyncStorage.getItem('token'); // 👈 where you store token after login

  //   if (!token) {
  //     Alert.alert('Authentication Error', 'User not logged in.');
  //     return;
  //   }

  //   const response = await fetch('http://10.102.46.225:5000/complaints', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${token}`, // 👈 important!
  //     },
  //     body: JSON.stringify(complaint),
  //   });

  //   if (response.ok) {
  //     Alert.alert('Success', 'Complaint submitted successfully');
  //     navigation.goBack();
  //   } else {
  //     const errorData = await response.json();
  //     console.log('Submission failed:', errorData);
  //     Alert.alert('Error', errorData.reason || 'Failed to submit complaint');
  //   }
  // } catch (error) {
  //   Alert.alert('Network Error', error.message);
  // }
  // };

  const handleSubmit = async () => {
  if (!name || !contact || !issueType || !description || !location) {
    Alert.alert('Validation Error', 'Please fill in all required fields.');
    return;
  }

  const complaint = { name, contact, issueType, description, location };

  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      Alert.alert('Authentication Error', 'User not logged in.');
      return;
    }

    const response = await API.post('/complaints', complaint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    Alert.alert('Success', 'Complaint submitted successfully');
    navigation.goBack();
  } catch (error) {
    console.log('❌ Submission failed:', error?.response?.data || error.message);
    Alert.alert('Error', error?.response?.data?.reason || 'Failed to submit complaint');
  }
  };


  return (
        <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'} </Text>
        </TouchableOpacity>
        <Text style={styles.title}>Raise Complaint</Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Contact</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your contact"
          keyboardType="phone-pad"
          value={contact}
          onChangeText={setContact}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Issue Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Road, Water"
          value={issueType}
          onChangeText={setIssueType}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { minHeight: 100 }]}
          placeholder="Describe the issue"
          multiline
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter location"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ComplaintScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    paddingVertical: 20,
    paddingHorizontal: 16,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 24,
    color: '#0e141b',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0e141b',
    textAlign: 'center',
    marginRight: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#0e141b',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#e7edf3',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0e141b',
  },
  buttonRow: {
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#e7edf3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#0e141b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#1672ce',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
  },
});