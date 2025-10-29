import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🚧 Placeholder Screen</Text>
      <Text style={styles.subText}>This screen is under construction.</Text>
    </View>
  );
};

export default PlaceholderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subText: {
    fontSize: 16,
    marginTop: 10,
    color: '#64748b',
  },
});
