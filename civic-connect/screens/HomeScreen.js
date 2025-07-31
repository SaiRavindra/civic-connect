// screens/HomeScreen.js

import React, { useEffect,useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  BackHandler,       // ✅ Correct spelling
  ToastAndroid,      // ✅ For Android toast
} from 'react-native';


const HomeScreen = ({ navigation }) => {
  const backPressCount = useRef(0);

  useEffect(() => {
    const backAction = () => {
      if (backPressCount.current === 0) {
        backPressCount.current += 1;
        ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);

        setTimeout(() => {
          backPressCount.current = 0;
        }, 2000); // Reset after 2 seconds

        return true; // Prevent default back action
      } else {
        BackHandler.exitApp(); // Exit app on second press
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove(); // Clean up
  }, []);
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC884YBO2B7hHQqGnX0o6UlzMHyFWNMGixFT7tGOu0llTSfgjMJ0KQniCQqiViK2OL0FDj5MdKFGv-OCnke348mWS4uN57AVgPnP6rw4JRK93-V6tgbkjYBxj7o8od8zXAReTD_IbRmbk30MBkG2BojP9-b5jkBTVaXZrVud-foccVV7cjY21h4GrDW9ORTW1uph868KiWDyxVzDsf7wgYZa2rLhL9PL3iwGNGZhX5wSdxt-OwRX4csDkQGvmOi2uHDqut1zNj75A',
        }}
        style={styles.image}
        imageStyle={{ borderRadius: 10 }}
      />
      <Text style={styles.heading}>Connecting Citizens with Civic Solutions</Text>
      <Text style={styles.subtext}>Report issues, track progress, and engage with your community.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Main')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  image: {
    height: 240,
    marginHorizontal: 20,
    marginTop: 40,
    resizeMode: 'cover',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0e141b',
    marginHorizontal: 16,
    marginTop: 20,
  },
  subtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#0e141b',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  button: {
    marginHorizontal: 20,
    height: 48,
    backgroundColor: '#1672ce',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
