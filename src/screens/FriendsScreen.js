import React, { useState, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const FriendsScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);

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

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.friend_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.friendItem} onPress={() => handleFriendOptions(item.friend_username)}>
            <Text>{item.friend_username}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddFriendScreen')}
      >
        <Text style={styles.addButtonText}>Add Friend</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  friendItem: {
    padding: 10,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addButton: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: '#8A2BE2',
    padding: 10,
    borderRadius: 5,
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
