import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [imageUri, setImageUri] = useState('');

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
      <Text style={styles.greeting}>Hello {username}</Text>
      <Button title="Make Post" onPress={handleMakePost} />
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
