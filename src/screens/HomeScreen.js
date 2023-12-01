import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SocialPost from '../components/SocialPost';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [posts, setPosts] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const getUsernameAndFetchPosts = async () => {
        try {
          const storedUsername = await AsyncStorage.getItem('username');
          if (storedUsername) {
            setUsername(storedUsername);
            const response = await axios.get(`http://127.0.0.1:2323/retrievePosts?username=${storedUsername}`);
            if (response.status === 200) {
              setPosts(response.data.posts);
            }
          } else {
            console.error('No username found');
          }
        } catch (e) {
          console.error('Failed to load username or fetch posts', e);
          Alert.alert('Error', 'Failed to load username or fetch posts');
        }
      };
      getUsernameAndFetchPosts();
    }, [])
  );
  

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

  const handleFriends = async () => {
    try {
        navigation.navigate('FriendsScreen');
    } catch (e) {
        Alert.alert('Error', 'Failed tonavigate to friend screen.');
        console.error('Error navigating to make friend screen:', e);
      }
  };
  

  return (
    <View style={styles.container}>
      <ScrollView style={styles.postsContainer}>
        {posts.map((post, index) => (
          <SocialPost key={post.post_id || index} username={username} pictureUrl={post.picture} text={post.content} />
        ))}
      </ScrollView>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleMakePost}>
          <Text style={styles.buttonText}>Make Post</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={navigateToSettings}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleTask}>
          <Text style={styles.buttonText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleFriends}>
          <Text style={styles.buttonText}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F7',
  },
  postsContainer: {
    flex: 1,
    marginTop: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#8A2BE2',
    padding: 10,
    borderRadius: 5,
    minWidth: 80,
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
