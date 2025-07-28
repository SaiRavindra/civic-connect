
// screens/ComplaintScreen.js

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const ComplaintScreen = ({ navigation }) => {
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
        <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor="#4e7397" />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Contact</Text>
        <TextInput style={styles.input} placeholder="Enter your contact number" placeholderTextColor="#4e7397" keyboardType="phone-pad" />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Issue Type</Text>
        <TextInput style={styles.input} placeholder="Select issue type" placeholderTextColor="#4e7397" />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, { minHeight: 100 }]} placeholder="Describe the issue" placeholderTextColor="#4e7397" multiline />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} placeholder="Auto-detect or enter location" placeholderTextColor="#4e7397" />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload Image (Optional)</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton}>
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