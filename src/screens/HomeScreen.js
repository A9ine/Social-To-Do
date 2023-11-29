import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
      const storedUsername = await AsyncStorage.getItem('username');
      if (!storedUsername) {
        Alert.alert('Error', 'Username not found');
        return;
      }
  
      const response = await axios.get('http://127.0.0.1:2323/getIncompletedTasks', {
        params: { username: storedUsername }
      });
  
      if (response.status === 200 && response.data.tasks.length > 0) {
        navigation.navigate('MakePostScreen', { tasks: response.data.tasks });
      } else {
        Alert.alert('No Tasks', 'There are no incomplete tasks to post. Please add a task');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch tasks or navigate to post screen.');
      console.error('Error navigating to make post screen:', e);
    }
  };

  const navigateToSettings = () => {
    navigation.navigate('SettingScreen'); //navigating to SettingScreen
  }

  const handleTask = async () => {
    try {
        navigation.navigate('TaskScreen');
    } catch (e) {
        Alert.alert('Error', 'Failed tonavigate to task screen.');
        console.error('Error navigating to make post screen:', e);
      }
  };
  

  return (
    <View style={styles.container}>
      {/* Existing components */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
      <Text style={styles.greeting}>Hello {username}</Text>
      <TouchableOpacity style={styles.button} onPress={handleMakePost}>
        <Text style={styles.buttonText}>Make Post</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={navigateToSettings}>
        <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleTask}>
        <Text style={styles.buttonText}>Tasks</Text>
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
