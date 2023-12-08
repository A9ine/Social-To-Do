import React, { useState, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const FriendsScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const [numPosts, setNumPosts] = useState(0);

  const fetchFriends = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (username) {
        const response = await axios.get('http://127.0.0.1:2323/getFriends', {
          params: { username }
        });
        if (response.status === 200) {
          setFriends(response.data.friends);
        } else {
          Alert.alert('Error', 'Failed to fetch friends');
        }
      }
    } catch (error) {
      console.error('Fetch friends error:', error);
      Alert.alert('Error', 'Failed to fetch friends due to a network error');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFriends();
      return () => setFriends([]);
    }, [])
  );

  const handleFriendOptions = (friendUsername) => {
    Alert.alert(
      "Friend Options",
      `Choose an option for ${friendUsername}`,
      [
        {
          text: "View Tasks",
          onPress: () => {
            // Navigate to task screen with friend's username
            navigation.navigate('TaskScreen', { username: friendUsername });
          }
        },
        {
          text: "Unfriend",
          onPress: () => unfriend(friendUsername),
          style: "destructive"
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
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

  const handleTask = async () => {
    try {
        navigation.navigate('TaskScreen');
    } catch (e) {
        Alert.alert('Error', 'Failed to navigate to task screen.');
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

  const navigateToSettings = () => {
    navigation.navigate('SettingScreen'); //navigating to SettingScreen
  }

  const handleSignOut = async () => {
    try {
      await AsyncStorage.clear();
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Error', 'Sign out failed');
      console.error('Sign out error:', e);
    }
  };

  const unfriend = async (friendUsername) => {
    try {
      // Assuming you have an endpoint to unfriend a user
      const username = await AsyncStorage.getItem('username');
      const response = await axios.post('http://127.0.0.1:2323/deleteFriend', {
        user1: username,
        user2: friendUsername
      });
      if (response.status === 200) {
        Alert.alert('Success', `${friendUsername} has been removed from your friends.`);
        fetchFriends(); // Refresh the friends list
      } else {
        Alert.alert('Error', 'Could not unfriend at this time, please try again later.');
      }
    } catch (error) {
      console.error('Unfriend error:', error);
      Alert.alert('Error', 'An error occurred while trying to unfriend.');
    }
  };

  useFocusEffect( //dummy. will be used after we fetch the number of posts in the future
    useCallback(() => {
      fetchFriends();
      //fetchNumPosts(); // Fetch the number of posts
      return () => {
        setFriends([]);
        setNumPosts(0);
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileStats}>
        
        <Text style={styles.statItem}>Friends: {friends.length}</Text>
        <TouchableOpacity onPress={navigateToSettings}>
          <Image
            style={styles.navIcon}
            source={require('../assets/settings.png')}
          />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={friends}
        keyExtractor={(item) => item.friend_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.friendItem} onPress={() => handleFriendOptions(item.friend_username)}>
            <View style={styles.avatar}></View>
            <Text style={styles.friendText}>{item.friend_username}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddFriendScreen')}
      >
        <Text style={styles.addButtonText}>Add Friend</Text>
      </TouchableOpacity>

    {/* Bottom Navigation Bar */}
    <View style={styles.bottomNavBar}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
          <Image
            style={styles.navIcon}
            source={require('../assets/home.png')} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMakePost}>
          <Image
            style={styles.navIcon}
            source={require('../assets/createPost.png')} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTask}>
          <Image
            style={styles.taskNavIcon}
            source={require('../assets/tasks.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFriends}>
          <Image
            style={styles.navIcon}
            source={require('../assets/friends.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut}>
          <Image
            style={styles.navIcon}
            source={require('../assets/signOut.png')}
          />
        </TouchableOpacity>
      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F3F3F7',
    position: 'relative',
  },

  container: {
    flex: 1,
  },

  friendItem: {
    backgroundColor: "#EDE7F6", // Light purple background
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10, // Rounded corners
    shadowColor: "#9575CD", // Deeper purple for shadow
    shadowOpacity: 0,
    shadowRadius: 6,
    elevation: 5, // Slight elevation for a subtle shadow effect
    flexDirection: 'row', // Align items in a row
    alignItems: 'center', // Center items vertically
    minHeight: 60, // Increase height for prominence
  },
  friendText: {
    fontSize: 20, // Larger font size
    fontWeight: 'bold', // Bold for emphasis
    color: '#673AB7', // Darker purple for contrast
    flex: 1, // Take up available space
    marginLeft: 15, // Margin to space out text from the edge
  },

  navIcon: {
    width: 25, // Adjusted for optimal size
    height: 25, // Adjusted for optimal size
    resizeMode: 'contain',
  },
  taskNavIcon: {
    width: 50, 
    height: 50, 
    resizeMode: 'contain',
    bottom: 25,
  },
  bottomNavBar: {
    flexDirection: 'row', // Ensures horizontal layout
    justifyContent: 'space-around', // Evenly spaces the icons
    backgroundColor: '#FFFFFF',
    paddingVertical: 0,
    paddingTop: 8,
    position: 'absolute',
    bottom: -15,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    alignItems: 'center',
  },

  statItem: {
    fontSize: 16,
    fontWeight: 'bold',
  },


  friendItem: {
    padding: 10,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addButton: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#8A2BE2',
    padding: 10,
    borderRadius: 5,
    top: '50%', // Centered vertically
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  friendItem: {
    backgroundColor: "#ddd", // Slight background color
    marginBottom: 5,
    borderRadius: 5,
  },
});

export default FriendsScreen;
