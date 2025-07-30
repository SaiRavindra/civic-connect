import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import API from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const token = response.data.token;
      await AsyncStorage.setItem("token", token);

      console.log("Login success:", token);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>CivicConnect</Text>
      <Text style={styles.heading}>Welcome Back</Text>

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

      <TouchableOpacity>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.signup}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9fafb",
    padding: 20,
    paddingTop: 80,
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111418",
    textAlign: "center",
    marginBottom: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111418",
    textAlign: "center",
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
  forgot: {
    color: "#5e7387",
    fontSize: 14,
    textAlign: "left",
    textDecorationLine: "underline",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#b8cee4",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#111418",
    fontSize: 16,
    fontWeight: "bold",
  },
  signup: {
    color: "#5e7387",
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
