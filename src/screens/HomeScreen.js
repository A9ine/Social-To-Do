import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('first_name');
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

  const handleMakePost = async () => {
    try {
      navigation.navigate('MakePostScreen');
    } catch (e) {
      Alert.alert('Error');
      console.error('Error navigating to make post screen:', e);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
      <Text style={styles.greeting}>Hello {username}</Text>
      <TouchableOpacity style={styles.button} onPress={handleMakePost}>
        <Text style={styles.buttonText}>Make Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F7', // Light background color
  },
  greeting: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#4B3F72', // Darker purple for text
  },
  button: {
    backgroundColor: '#8A2BE2', // Purple color for the button
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  signOutButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#8A2BE2',
    padding: 8,
    borderRadius: 5,
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
