import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import API from "../utils/api";

const SignupScreen = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
  if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  try {
    const response = await API.post("/auth/signup", {
      name: fullName,
      email,
      password,
    });

    console.log("Signup success:", response.data);
    // Optionally: navigate to Login or Home, and store token
    navigation.navigate("Home");
  } catch (error) {
    console.error("Signup failed:", error.response?.data || error.message);
  }
};

  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Create your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#5e7387"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#5e7387"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#5e7387"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#5e7387"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9fafb",
    padding: 20,
    paddingTop: 60,
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111418",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#eaedf0",
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    color: "#111418",
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#b8cee4",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
  },
  buttonText: {
    color: "#111418",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginText: {
    color: "#5e7387",
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});

export default SignupScreen;
