import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Fetch the username from AsyncStorage
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (e) {
        console.error('Failed to load username', e);
      }
    };

    getUsername();
  }, []);

  const handleSignOut = async () => {
    try {
      await AsyncStorage.clear();
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Error', 'Sign out failed');
      console.error('Sign out error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello {username}</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
